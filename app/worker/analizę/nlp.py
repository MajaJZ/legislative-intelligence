import re
import spacy
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import NMF
from db import supabase, upsert

nlp = spacy.load("en_core_web_sm")

def extract_entities(text: str) -> dict:
    doc = nlp(text[:100000])
    return {
        "orgs": list({ent.text.strip() for ent in doc.ents if ent.label_ == "ORG" and len(ent.text.strip()) > 2}),
        "money": list({ent.text.strip() for ent in doc.ents if ent.label_ == "MONEY"}),
        "laws": list({ent.text.strip() for ent in doc.ents if ent.label_ == "LAW"}),
    }

def topic_model(texts: list[str], n_topics: int = 8) -> list[list[str]]:
    vectorizer = TfidfVectorizer(
        stop_words="english",
        max_features=2000,
        ngram_range=(1, 2),
        min_df=2,
    )
    matrix = vectorizer.fit_transform(texts)
    features = vectorizer.get_feature_names_out()
    model = NMF(n_components=n_topics, random_state=42, init="nndsvda")
    model.fit(matrix)
    topics = []
    for topic in model.components_:
        top_indices = topic.argsort()[-10:][::-1]
        topics.append([features[i] for i in top_indices])
    return topics

def process_bills(limit: int = 200):
    bills = (
        supabase.table("bills")
        .select("id,title,summary,subjects")
        .is_("topic_terms", "null")
        .limit(limit)
        .execute()
        .data
    )
    if not bills:
        return

    texts = [f"{b['title']}. {b.get('summary') or ''}" for b in bills]
    topics = topic_model(texts, n_topics=min(8, max(2, len(texts) // 10)))
    all_terms = sorted({term for topic in topics for term in topic})

    rows = []
    for bill, text in zip(bills, texts):
        entities = extract_entities(text)
        subject_terms = [s.lower() for s in (bill.get("subjects") or [])]
        rows.append({
            "id": bill["id"],
            "topic_terms": sorted(set(subject_terms + all_terms[:20])),
        })

    for row in rows:
        supabase.table("bills").update({
            "topic_terms": row["topic_terms"],
        }).eq("id", row["id"]).execute()
