# 🧠 Multi-Domain Support Triage Agent

A terminal-based AI support triage system that processes support tickets across multiple domains and generates safe, grounded responses using a provided support corpus.

---

## 🚀 Overview

This project builds an automated support agent capable of:

- Classifying support requests
- Detecting high-risk/sensitive issues
- Retrieving relevant documentation from a support corpus
- Generating grounded responses
- Escalating cases when necessary

Supported domains:
- HackerRank
- Claude
- Visa

---

## ⚙️ System Design

The system follows a pipeline architecture:

1. **Input Processing**
   - Reads support tickets from CSV

2. **Request Classification**
   - Categorizes into:
     - `product_issue`
     - `bug`
     - `feature_request`
     - `invalid`

3. **Risk Detection**
   - Identifies sensitive issues such as:
     - fraud
     - payments
     - account access
   - Flags them for escalation

4. **Retrieval (RAG)**
   - Loads support corpus from `/data`
   - Matches user issue with relevant documents using keyword scoring
   - Ensures responses are grounded in real documentation

5. **Response Generation**
   - Generates user-facing answers using retrieved context
   - Avoids hallucination by restricting to corpus

6. **Decision Logic**
   - `replied` → safe + supported queries
   - `escalated` → sensitive or unsupported queries

---

## 🧠 Key Features

- ✅ Rule-based classification for robustness
- ✅ Retrieval-Augmented Generation (RAG)
- ✅ Safety-first escalation logic
- ✅ Corpus-grounded responses (no hallucination)
- ✅ Multi-domain handling
- ✅ Structured CSV output

---

## 📂 Project Structure
code/
├── main.js
├── package.json
data/
support_tickets/
├── support_tickets.csv
├── output.csv
log.txt



---

## ▶️ How to Run

1. Install dependencies:

```bash
npm install

2. Run the agent:
node main.js

3. Output will be generated at:
support_tickets/output.csv

📊 Output Format
Each ticket generates:
FieldDescriptionstatusreplied / escalatedproduct_areadomain categoryresponseuser-facing answerjustificationreasoning for decisionrequest_typeclassification

🔒 Safety & Constraints

1. Uses ONLY provided support corpus

2. No external knowledge sources

3. Escalates:

a. fraud / payment issues

b. account access problems

c. unsupported queries

----
🧠 Design Decisions


1. Rule-based classification ensures predictable behavior

2. Keyword scoring retrieval balances simplicity and effectiveness


3. Escalation-first approach prioritizes user safety


4. Corpus grounding prevents hallucinated responses

--------------

🚧 Limitations


1. Basic keyword-based retrieval (can be improved with embeddings)

2. Limited semantic understanding

3. No ranking of multiple documents

----------

🔮 Future Improvements


Vector search (FAISS / embeddings)


LLM-based summarization


Better multi-document retrieval


Confidence scoring



🏁 Conclusion
This system demonstrates a production-style support triage agent with:


Clear reasoning


Safety-aware decision making


Grounded responses using RAG



👤 Author
Uzra Khan
