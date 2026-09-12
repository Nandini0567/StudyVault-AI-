import os
import re
from pathlib import Path
from typing import List, Dict, Any, Tuple
from pypdf import PdfReader
from app.core.config import settings

def sanitize_filename(filename: str) -> str:
    return re.sub(r'[^a-zA-Z0-9_.-]', '_', filename)

def extract_pdf_chunks(file_path: str, chunk_size: int = 600, overlap: int = 100) -> Tuple[int, List[Dict[str, Any]]]:
    """
    Extracts text from each page of a PDF and splits it into chunks
    with page number tracking.
    """
    reader = PdfReader(file_path)
    total_pages = len(reader.pages)
    chunks = []
    chunk_index = 0

    for page_num, page in enumerate(reader.pages, start=1):
        try:
            text = page.extract_text() or ""
        except Exception:
            text = ""
            
        cleaned_text = re.sub(r'\s+', ' ', text).strip()
        if not cleaned_text:
            continue

        start = 0
        text_len = len(cleaned_text)
        
        while start < text_len:
            end = min(start + chunk_size, text_len)
            
            # Try to break at sentence or space boundary
            if end < text_len:
                boundary = cleaned_text.rfind('. ', start, end)
                if boundary != -1 and boundary > start + (chunk_size // 2):
                    end = boundary + 1
                else:
                    space = cleaned_text.rfind(' ', start, end)
                    if space != -1 and space > start + (chunk_size // 2):
                        end = space

            chunk_content = cleaned_text[start:end].strip()
            if len(chunk_content) > 30:  # Avoid empty or near-empty chunks
                chunks.append({
                    "page_number": page_num,
                    "chunk_index": chunk_index,
                    "content": chunk_content
                })
                chunk_index += 1

            if end >= text_len:
                break
            start = end - overlap

    return total_pages, chunks

def save_uploaded_pdf(user_id: int, semester_id: int, original_filename: str, file_bytes: bytes) -> Tuple[str, int]:
    user_upload_dir = Path(settings.UPLOAD_DIR) / f"user_{user_id}" / f"semester_{semester_id}"
    user_upload_dir.mkdir(parents=True, exist_ok=True)
    
    safe_name = sanitize_filename(original_filename)
    unique_name = f"{int(os.path.getmtime(settings.UPLOAD_DIR) if os.path.exists(settings.UPLOAD_DIR) else 1)}_{safe_name}"
    target_path = user_upload_dir / unique_name
    
    with open(target_path, "wb") as f:
        f.write(file_bytes)
        
    file_size = len(file_bytes)
    return str(target_path), file_size
