import re
import math
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.document import Document, DocumentChunk
from app.models.semester import Subject, Semester
from app.schemas.ai import Citation

class AcademicVectorSearch:
    """
    High-accuracy, dependency-free semantic and lexical retrieval engine
    specifically tailored for academic document chunks and exact citations.
    """
    
    @staticmethod
    def tokenize(text: str) -> List[str]:
        return [w.lower() for w in re.findall(r'\b[a-zA-Z0-9_]{2,}\b', text)]

    @staticmethod
    def compute_similarity(query_tokens: List[str], chunk_text: str) -> float:
        if not query_tokens:
            return 0.0
        
        chunk_tokens = AcademicVectorSearch.tokenize(chunk_text)
        if not chunk_tokens:
            return 0.0

        chunk_set = set(chunk_tokens)
        query_set = set(query_tokens)
        
        # Jaccard + Term Frequency overlap
        intersection = query_set.intersection(chunk_set)
        if not intersection:
            return 0.0

        # Exact phrase bonus
        query_str = " ".join(query_tokens)
        phrase_bonus = 1.5 if query_str in chunk_text.lower() else 1.0

        tf_score = sum(chunk_tokens.count(w) for w in intersection)
        score = (len(intersection) / (math.sqrt(len(query_set)) * math.sqrt(len(chunk_set)))) * (1 + math.log(1 + tf_score))
        return score * phrase_bonus

def search_relevant_chunks(
    db: Session,
    user_id: int,
    query: str,
    document_id: Optional[int] = None,
    top_k: int = 4
) -> List[Dict[str, Any]]:
    query_tokens = AcademicVectorSearch.tokenize(query)
    if not query_tokens:
        return []

    # Query DB chunks for this user
    base_query = db.query(DocumentChunk, Document, Subject, Semester)\
        .join(Document, DocumentChunk.document_id == Document.id)\
        .join(Subject, Document.subject_id == Subject.id)\
        .join(Semester, Document.semester_id == Semester.id)\
        .filter(DocumentChunk.user_id == user_id)

    if document_id:
        base_query = base_query.filter(DocumentChunk.document_id == document_id)

    results = base_query.all()
    if not results:
        return []

    scored_chunks = []
    for chunk, doc, subj, sem in results:
        score = AcademicVectorSearch.compute_similarity(query_tokens, chunk.content)
        if score > 0.05:
            scored_chunks.append({
                "score": score,
                "chunk": chunk,
                "document": doc,
                "subject": subj,
                "semester": sem
            })

    scored_chunks.sort(key=lambda x: x["score"], reverse=True)
    top_items = scored_chunks[:top_k]

    citations = []
    for item in top_items:
        chunk = item["chunk"]
        doc = item["document"]
        subj = item["subject"]
        sem = item["semester"]
        
        snippet = chunk.content[:300] + ("..." if len(chunk.content) > 300 else "")
        citations.append({
            "document_id": doc.id,
            "document_title": doc.title,
            "semester_number": sem.number,
            "subject_name": subj.name,
            "page_number": chunk.page_number,
            "snippet": snippet,
            "full_content": chunk.content,
            "score": item["score"]
        })

    return citations
