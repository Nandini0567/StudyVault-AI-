import os
from pathlib import Path
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.semester import Semester, Subject
from app.models.document import Document, DocumentChunk
from app.models.quick_note import QuickNote
from app.models.core_knowledge import CoreKnowledge
from app.models.resource import ImportantResource

BRANCH_SUBJECTS = {
    "Computer Science & Engineering": {
        1: [
            {"name": "Engineering Mathematics I", "code": "MATH101", "color": "blue"},
            {"name": "Applied Physics", "code": "PHYS101", "color": "amber"},
            {"name": "Programming in C", "code": "CS101", "color": "emerald"},
            {"name": "Basic Electrical Engineering", "code": "EE101", "color": "purple"}
        ],
        2: [
            {"name": "Data Structures & Algorithms", "code": "CS201", "color": "emerald"},
            {"name": "Object-Oriented Programming (Java)", "code": "CS202", "color": "orange"},
            {"name": "Discrete Mathematics", "code": "MATH201", "color": "blue"},
            {"name": "Digital Logic Design", "code": "CS203", "color": "indigo"}
        ],
        3: [
            {"name": "Database Management Systems (DBMS)", "code": "CS301", "color": "cyan"},
            {"name": "Operating Systems", "code": "CS302", "color": "violet"},
            {"name": "Computer Organization & Architecture", "code": "CS303", "color": "rose"}
        ],
        4: [
            {"name": "Design & Analysis of Algorithms", "code": "CS401", "color": "emerald"},
            {"name": "Computer Networks", "code": "CS402", "color": "blue"},
            {"name": "Software Engineering", "code": "CS403", "color": "teal"}
        ],
        5: [
            {"name": "Theory of Computation", "code": "CS501", "color": "indigo"},
            {"name": "Compiler Design", "code": "CS502", "color": "purple"},
            {"name": "Web Technologies", "code": "CS503", "color": "amber"}
        ],
        6: [
            {"name": "Machine Learning", "code": "CS601", "color": "emerald"},
            {"name": "Cloud Computing", "code": "CS602", "color": "blue"},
            {"name": "Cryptography & Network Security", "code": "CS603", "color": "rose"}
        ],
        7: [
            {"name": "Artificial Intelligence", "code": "CS701", "color": "purple"},
            {"name": "Big Data Analytics", "code": "CS702", "color": "cyan"},
            {"name": "Internet of Things (IoT)", "code": "CS703", "color": "teal"}
        ],
        8: [
            {"name": "Major Capstone Project", "code": "CS801", "color": "emerald"},
            {"name": "Technical Seminar & Viva", "code": "CS802", "color": "indigo"}
        ]
    },
    "Electronics & Communication Engineering": {
        1: [
            {"name": "Engineering Mathematics I", "code": "MATH101", "color": "blue"},
            {"name": "Applied Physics", "code": "PHYS101", "color": "amber"},
            {"name": "Programming in C", "code": "CS101", "color": "emerald"},
            {"name": "Basic Electronics Engineering", "code": "EC101", "color": "rose"}
        ],
        2: [
            {"name": "Electronic Devices & Circuits (EDC)", "code": "EC201", "color": "rose"},
            {"name": "Network Theory", "code": "EC202", "color": "indigo"},
            {"name": "Signals & Systems", "code": "EC203", "color": "cyan"},
            {"name": "Mathematics II", "code": "MATH201", "color": "blue"}
        ],
        3: [
            {"name": "Analog Circuits", "code": "EC301", "color": "orange"},
            {"name": "Digital System Design", "code": "EC302", "color": "purple"},
            {"name": "Electromagnetic Fields & Waves", "code": "EC303", "color": "blue"}
        ],
        4: [
            {"name": "Analog & Digital Communication", "code": "EC401", "color": "teal"},
            {"name": "Digital Signal Processing (DSP)", "code": "EC402", "color": "cyan"},
            {"name": "Microprocessors & Microcontrollers", "code": "EC403", "color": "indigo"}
        ],
        5: [
            {"name": "VLSI Design", "code": "EC501", "color": "rose"},
            {"name": "Antennas & Wave Propagation", "code": "EC502", "color": "amber"},
            {"name": "Control Systems", "code": "EC503", "color": "emerald"}
        ],
        6: [
            {"name": "Embedded Systems", "code": "EC601", "color": "purple"},
            {"name": "Microwave Engineering", "code": "EC602", "color": "blue"},
            {"name": "Optical Communication", "code": "EC603", "color": "cyan"}
        ],
        7: [
            {"name": "Wireless Cellular Networks (5G)", "code": "EC701", "color": "indigo"},
            {"name": "Radar & Satellite Systems", "code": "EC702", "color": "emerald"}
        ],
        8: [
            {"name": "Major Capstone Project", "code": "EC801", "color": "rose"},
            {"name": "Technical Seminar & Viva", "code": "EC802", "color": "indigo"}
        ]
    },
    "Mechanical Engineering": {
        1: [
            {"name": "Engineering Mathematics I", "code": "MATH101", "color": "blue"},
            {"name": "Engineering Physics", "code": "PHYS101", "color": "amber"},
            {"name": "Engineering Graphics & Design", "code": "ME101", "color": "indigo"},
            {"name": "Programming in C", "code": "CS101", "color": "emerald"}
        ],
        2: [
            {"name": "Engineering Mechanics", "code": "ME201", "color": "rose"},
            {"name": "Material Science & Metallurgy", "code": "ME202", "color": "orange"},
            {"name": "Manufacturing Processes I", "code": "ME203", "color": "teal"},
            {"name": "Mathematics II", "code": "MATH201", "color": "blue"}
        ],
        3: [
            {"name": "Thermodynamics", "code": "ME301", "color": "amber"},
            {"name": "Mechanics of Solids", "code": "ME302", "color": "indigo"},
            {"name": "Fluid Mechanics & Machinery", "code": "ME303", "color": "cyan"}
        ],
        4: [
            {"name": "Applied Thermodynamics", "code": "ME401", "color": "amber"},
            {"name": "Kinematics of Machinery", "code": "ME402", "color": "rose"},
            {"name": "Manufacturing Technology II", "code": "ME403", "color": "teal"}
        ],
        5: [
            {"name": "Heat & Mass Transfer", "code": "ME501", "color": "orange"},
            {"name": "Machine Design I", "code": "ME502", "color": "purple"},
            {"name": "Dynamics of Machinery", "code": "ME503", "color": "blue"}
        ],
        6: [
            {"name": "Design of Transmission Systems", "code": "ME601", "color": "indigo"},
            {"name": "Finite Element Analysis (FEA)", "code": "ME602", "color": "emerald"},
            {"name": "Automobile Engineering", "code": "ME603", "color": "rose"}
        ],
        7: [
            {"name": "CAD/CAM & Automation", "code": "ME701", "color": "cyan"},
            {"name": "Refrigeration & Air Conditioning", "code": "ME702", "color": "blue"}
        ],
        8: [
            {"name": "Major Capstone Project", "code": "ME801", "color": "emerald"},
            {"name": "Technical Seminar & Viva", "code": "ME802", "color": "indigo"}
        ]
    }
}

# Alias other branches to appropriate default curriculum
BRANCH_SUBJECTS["Information Technology"] = BRANCH_SUBJECTS["Computer Science & Engineering"]
BRANCH_SUBJECTS["Artificial Intelligence & Data Science"] = BRANCH_SUBJECTS["Computer Science & Engineering"]
BRANCH_SUBJECTS["Electrical & Electronics Engineering"] = BRANCH_SUBJECTS["Electronics & Communication Engineering"]
BRANCH_SUBJECTS["Civil Engineering"] = BRANCH_SUBJECTS["Mechanical Engineering"]
BRANCH_SUBJECTS["Chemical Engineering"] = BRANCH_SUBJECTS["Mechanical Engineering"]
BRANCH_SUBJECTS["Biotechnology"] = BRANCH_SUBJECTS["Computer Science & Engineering"]

def seed_student_vault(db: Session, user_id: int, branch: str = "Computer Science & Engineering"):
    """
    Seeds initial 8 semesters, branch-tailored engineering subjects,
    curated quick notes, permanent core knowledge, and starter materials.
    """
    semester_titles = [
        "Semester 1 (Freshman Fall)",
        "Semester 2 (Freshman Spring)",
        "Semester 3 (Sophomore Fall)",
        "Semester 4 (Sophomore Spring)",
        "Semester 5 (Junior Fall)",
        "Semester 6 (Junior Spring)",
        "Semester 7 (Senior Fall)",
        "Semester 8 (Senior Spring)"
    ]

    sem_objects = {}
    for idx, title in enumerate(semester_titles, start=1):
        sem = Semester(
            user_id=user_id,
            number=idx,
            title=title,
            is_active=(idx == 1)
        )
        db.add(sem)
        db.flush()
        sem_objects[idx] = sem

    # Branch tailored subjects
    branch_curriculum = BRANCH_SUBJECTS.get(branch, BRANCH_SUBJECTS["Computer Science & Engineering"])

    subj_objects = {}
    for sem_num, subjs in branch_curriculum.items():
        if sem_num in sem_objects:
            sem = sem_objects[sem_num]
            for s in subjs:
                subj = Subject(
                    semester_id=sem.id,
                    user_id=user_id,
                    name=s["name"],
                    code=s["code"],
                    color=s["color"],
                    description=f"Curriculum coursework for {branch} ({sem.title})"
                )
                db.add(subj)
                db.flush()
                subj_objects[(sem_num, s["name"])] = subj

    # 3. Create Sample Starter Documents with Chunks for RAG demonstration
    # Find matching subjects in Sem 1 and Sem 2
    sem1_subjs = [s for (sn, sname), s in subj_objects.items() if sn == 1]
    sem2_subjs = [s for (sn, sname), s in subj_objects.items() if sn == 2]

    primary_sem1_subj = sem1_subjs[0] if sem1_subjs else None
    primary_sem2_subj = sem2_subjs[0] if sem2_subjs else None
    secondary_sem2_subj = sem2_subjs[1] if len(sem2_subjs) > 1 else primary_sem2_subj

    starter_docs = [
        {
            "subject": primary_sem2_subj,
            "sem_id": sem_objects[2].id,
            "title": "DSA_Complete_Revision_Notes.pdf",
            "file_name": "DSA_Complete_Revision_Notes.pdf",
            "tags": "Notes,Revision,Exam",
            "description": "Comprehensive notes covering Asymptotic Analysis, Arrays, Linked Lists, Trees, and Sorting algorithms.",
            "is_favorite": True,
            "is_important": True,
            "flag_revision": True,
            "chunks": [
                (1, "Asymptotic Notations: Big-O represents the upper bound and worst-case execution time of an algorithm. Omega notation represents lower bound and best-case performance. Theta notation denotes tight bound. Common complexities: Constant O(1), Logarithmic O(log n), Linear O(n), Linearithmic O(n log n), Quadratic O(n^2)."),
                (2, "Array vs Linked List: Arrays provide O(1) random memory access via index calculation, but insertion and deletion at beginning takes O(n) due to shifting. Singly Linked Lists provide O(1) insertion at head if pointer is maintained, but element lookup takes O(n) sequential traversal. Doubly linked lists maintain prev and next pointers."),
                (3, "Binary Search Tree (BST) Properties: For every node X in a BST, all values in its left subtree are strictly smaller than X, and all values in its right subtree are strictly greater. Search, insert, and delete operations take O(h) where h is the tree height. In a balanced BST (AVL or Red-Black Tree), h is O(log n), guaranteeing logarithmic lookup."),
                (4, "Sorting Complexities: QuickSort uses divide-and-conquer with a pivot element. Average time complexity is O(n log n), worst-case is O(n^2) when pivot is poorly chosen. MergeSort always guarantees O(n log n) worst-case time by splitting array in halves, but requires O(n) auxiliary space.")
            ]
        },
        {
            "subject": secondary_sem2_subj,
            "sem_id": sem_objects[2].id,
            "title": "Java_OOP_Core_Concepts.pdf",
            "file_name": "Java_OOP_Core_Concepts.pdf",
            "tags": "Notes,Interview,Placement",
            "description": "Fundamental OOP pillars in Java, Polymorphism, Abstract classes vs Interfaces, and Collections framework.",
            "is_favorite": True,
            "is_important": True,
            "flag_interview": True,
            "chunks": [
                (1, "The Four Pillars of OOP: 1. Encapsulation: Bundling data (variables) and methods into a single class while restricting direct field access via private modifiers and public getters/setters. 2. Abstraction: Hiding implementation details and exposing only essential interfaces using abstract classes and interfaces."),
                (2, "Inheritance and Polymorphism in Java: Inheritance allows subclassing using 'extends' keyword to promote code reusability. Polymorphism allows an entity to take multiple forms. Compile-time polymorphism is achieved via method overloading (same method name, different parameter lists). Runtime polymorphism is achieved via method overriding (subclass overrides parent method with @Override annotation)."),
                (3, "Java Collections Framework: List (ArrayList, LinkedList, Vector), Set (HashSet, TreeSet, LinkedHashSet), and Map (HashMap, TreeMap, LinkedHashMap). HashMap stores key-value pairs with O(1) average lookup using hashing. It allows one null key and multiple null values. In case of collisions, Java 8 uses balanced trees inside buckets when threshold exceeds 8.")
            ]
        },
        {
            "subject": primary_sem1_subj,
            "sem_id": sem_objects[1].id,
            "title": "Engineering_Math_Formulas.pdf",
            "file_name": "Engineering_Math_Formulas.pdf",
            "tags": "Formulas,Exam,PYQ",
            "description": "Calculus, Differential Equations, Matrix Rank, and Eigenvalues with formulas and solved previous year questions.",
            "is_favorite": False,
            "is_important": True,
            "flag_exam": True,
            "chunks": [
                (1, "Matrix Eigenvalues and Eigenvectors: Characteristic equation is det(A - lambda * I) = 0. The sum of eigenvalues of matrix A equals the trace of A (sum of diagonal elements). The product of eigenvalues of matrix A equals the determinant of A: det(A) = lambda_1 * lambda_2 * ... * lambda_n. A matrix is invertible if and only if no eigenvalue is zero."),
                (2, "Taylor and Maclaurin Series: The Taylor series of a smooth function f(x) about x = a is given by sum from n=0 to infinity of [f^(n)(a) / n!] * (x - a)^n. Maclaurin series is a special case where expansion center a = 0. Euler's formula states: e^(i*x) = cos(x) + i*sin(x).")
            ]
        }
    ]

    for d in starter_docs:
        if d["subject"]:
            target_path = Path(settings.UPLOAD_DIR) / f"starter_{d['file_name']}"
            if not target_path.exists():
                try:
                    import pypdf
                    writer = pypdf.PdfWriter()
                    for _ in range(max(1, len(d["chunks"]))):
                        writer.add_blank_page(width=612, height=792)
                    with open(target_path, "wb") as f:
                        writer.write(f)
                except Exception as ex:
                    print(f"Notice: Failed to write starter PDF file: {ex}")

            doc = Document(
                user_id=user_id,
                subject_id=d["subject"].id,
                semester_id=d["sem_id"],
                title=d["title"],
                file_name=d["file_name"],
                file_path=str(target_path),
                file_size=1024 * 350,
                page_count=len(d["chunks"]),
                tags=d["tags"],
                description=d["description"],
                is_favorite=d["is_favorite"],
                is_important=d["is_important"],
                flag_exam=d.get("flag_exam", False),
                flag_revision=d.get("flag_revision", False),
                flag_interview=d.get("flag_interview", False)
            )
            db.add(doc)
            db.flush()

            for page_num, chunk_text in d["chunks"]:
                chunk = DocumentChunk(
                    document_id=doc.id,
                    user_id=user_id,
                    page_number=page_num,
                    chunk_index=page_num - 1,
                    content=chunk_text
                )
                db.add(chunk)

    # 4. Quick Notes
    quick_notes_data = [
        {
            "title": "Java HashMap vs TreeMap",
            "category": "Java",
            "tags": "Collections,Syntax,Interview",
            "code_snippet": "Map<String, Integer> map = new HashMap<>();\nmap.put(\"DSA\", 95);\nmap.putIfAbsent(\"DBMS\", 90);\nint val = map.getOrDefault(\"OS\", 0);\n\n// Iterate:\nfor (Map.Entry<String, Integer> entry : map.entrySet()) {\n    System.out.println(entry.getKey() + \" -> \" + entry.getValue());\n}",
            "explanation": "HashMap gives O(1) average time complexity using buckets and hashing. Keys are unordered. TreeMap guarantees O(log n) performance because it is backed by a Red-Black Tree and stores keys in natural sorted order."
        },
        {
            "title": "SQL Essential Commands & JOINs",
            "category": "SQL",
            "tags": "DBMS,Queries,CheatSheet",
            "code_snippet": "-- Group By with Having\nSELECT department_id, COUNT(*) as total_students, AVG(cgpa) as avg_cgpa\nFROM students\nGROUP BY department_id\nHAVING AVG(cgpa) > 8.0;\n\n-- LEFT JOIN syntax\nSELECT s.name, e.course_name\nFROM students s\nLEFT JOIN enrollments e ON s.id = e.student_id;",
            "explanation": "WHERE filters rows before aggregation; HAVING filters groups after aggregation. LEFT JOIN returns all rows from the left table and matched rows from the right table (NULL if no match)."
        },
        {
            "title": "Linux Server Administration & Diagnostics",
            "category": "Linux",
            "tags": "Commands,OS,Terminal",
            "code_snippet": "# Find files modified in last 24 hours\nfind /var/log -type f -mtime -1\n\n# Grep search recursively ignoring case\ngrep -rnI \"connection_timeout\" /etc/nginx/\n\n# Process monitoring\nps aux | grep python\nkill -9 <PID>\n\n# Permissions: rwx (4+2+1)\nchmod 755 script.sh",
            "explanation": "Essential commands for college lab exams and DevOps environments. grep -rnI gives line numbers and ignores binaries."
        },
        {
            "title": "DSA Sorting & Search Complexities",
            "category": "DSA",
            "tags": "TimeComplexity,Placement",
            "code_snippet": "Algorithm     | Best     | Average    | Worst    | Space\nBinary Search | O(1)     | O(log n)   | O(log n) | O(1)\nQuickSort     | O(n log n)| O(n log n) | O(n^2)   | O(log n)\nMergeSort     | O(n log n)| O(n log n) | O(n^2)   | O(n)\nHeapSort      | O(n log n)| O(n log n) | O(n log n)| O(1)",
            "explanation": "Must-memorize table for technical interviews. Note that MergeSort is stable and guarantees O(n log n) worst-case time, while QuickSort is in-place but worst-case O(n^2)."
        }
    ]

    for qn in quick_notes_data:
        note = QuickNote(
            user_id=user_id,
            title=qn["title"],
            category=qn["category"],
            tags=qn["tags"],
            code_snippet=qn["code_snippet"],
            explanation=qn["explanation"],
            is_favorite=True
        )
        db.add(note)

    # 5. Core Knowledge (Non-semester permanent concepts)
    core_knowledge_data = [
        {
            "topic": "OOP",
            "title": "Four Pillars of Object-Oriented Programming",
            "importance": "Critical",
            "key_points": "1. Encapsulation: Restrict direct variable modification using private access and methods.\n2. Abstraction: Expose what an object does, not how it does it (Interfaces).\n3. Inheritance: Derive child classes to eliminate duplicate code.\n4. Polymorphism: Static (overloading) and Dynamic (overriding with virtual dispatch).",
            "code_example": "abstract class Animal {\n    abstract void makeSound(); // Abstraction\n}\n\nclass Dog extends Animal { // Inheritance\n    @Override\n    void makeSound() { // Polymorphism\n        System.out.println(\"Woof\");\n    }\n}",
            "interview_notes": "Frequently asked in almost every tech round. Be prepared to explain why multiple inheritance is disallowed in Java (Diamond Problem) and how default methods in interfaces work."
        },
        {
            "topic": "DBMS",
            "title": "ACID Properties & Database Normalization",
            "importance": "Critical",
            "key_points": "ACID:\n- Atomicity: All or nothing execution of a transaction.\n- Consistency: Database moves from one valid state to another.\n- Isolation: Concurrent transactions do not interfere.\n- Durability: Committed updates survive system crashes.\n\nNormalization:\n- 1NF: Atomic values, no repeating groups.\n- 2NF: 1NF + no partial dependency on composite primary key.\n- 3NF: 2NF + no transitive dependency (non-key attributes depend only on primary key).\n- BCNF: Every determinant is a candidate key.",
            "code_example": "BEGIN TRANSACTION;\nUPDATE accounts SET balance = balance - 500 WHERE id = 1;\nUPDATE accounts SET balance = balance + 500 WHERE id = 2;\nCOMMIT;",
            "interview_notes": "Be ready to explain phantom reads, dirty reads, and transaction isolation levels (Read Uncommitted, Read Committed, Repeatable Read, Serializable)."
        },
        {
            "topic": "Operating Systems",
            "title": "Process vs Thread & Deadlock Conditions",
            "importance": "High",
            "key_points": "Process: Independent execution unit with its own address space, PCB, and file descriptors.\nThread: Lightweight execution unit inside a process sharing address space, heap, and code segment, but with its own stack and registers.\n\nDeadlock Coffman 4 Conditions:\n1. Mutual Exclusion\n2. Hold and Wait\n3. No Preemption\n4. Circular Wait",
            "code_example": "// Thread creation in Java\nThread t = new Thread(() -> {\n    System.out.println(\"Running in lightweight thread: \" + Thread.currentThread().getName());\n});\nt.start();",
            "interview_notes": "Know how Banker's Algorithm prevents deadlocks and why context switching between threads is faster than processes (no TLB / page table invalidation)."
        }
    ]

    for ck in core_knowledge_data:
        core = CoreKnowledge(
            user_id=user_id,
            topic=ck["topic"],
            title=ck["title"],
            importance=ck["importance"],
            key_points=ck["key_points"],
            code_example=ck["code_example"],
            interview_notes=ck["interview_notes"]
        )
        db.add(core)

    # 6. Important Resources
    resources_data = [
        {
            "title": "DSA Placement Cheat Sheet & Roadmap",
            "resource_type": "Cheat Sheet",
            "description": "Curated 75 essential coding questions covering Two Pointers, Sliding Window, Trees, and Dynamic Programming.",
            "tags": "Placement,DSA,TopPriority",
            "priority": "High",
            "is_verified": True
        },
        {
            "title": "Operating System Concepts (Silberschatz Handout Summary)",
            "resource_type": "Teacher Notes",
            "description": "Verified university lecture summaries covering Virtual Memory, Paging, Inverted Page Tables, and Disk Scheduling.",
            "tags": "OS,Verified,Exam",
            "priority": "High",
            "is_verified": True
        },
        {
            "title": "Clean Code & Java Design Patterns Handbook",
            "resource_type": "Reference Book",
            "description": "Factory, Singleton, Observer, and Strategy design patterns with practical enterprise architecture examples.",
            "tags": "OOP,DesignPatterns,Book",
            "priority": "Medium",
            "is_verified": True
        }
    ]

    for res in resources_data:
        r = ImportantResource(
            user_id=user_id,
            title=res["title"],
            resource_type=res["resource_type"],
            description=res["description"],
            tags=res["tags"],
            priority=res["priority"],
            is_verified=res["is_verified"]
        )
        db.add(r)

    db.commit()
