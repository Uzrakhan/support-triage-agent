const fs = require("fs");
const csv = require("csv-parser");
const { createObjectCsvWriter } = require("csv-writer");

const tickets = [];



function loadCorpus() {
    const basePath = "../data";
    let docs = [];

    function readFolder(folderPath) {
        const files = fs.readdirSync(folderPath);

        for(const file of files) {
            const fullPath = `${folderPath}/${file}`;
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                readFolder(fullPath)
            } else {
                const content = fs.readFileSync(fullPath, "utf-8");
                docs.push(content)
            }
        }
    }

    readFolder(basePath);
    return docs;
}


function cleanText(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter(word => word.length > 2 && ![
      "the","and","for","with","this","that","have","from","your","please","help"
    ].includes(word));
}


function retrieveRelevantDocs(issue, docs) {
  const keywords = cleanText(issue);

  let bestDoc = "";
  let maxScore = 0;

  for (const doc of docs) {
    const lowerDoc = doc.toLowerCase();

    let score = 0;

    for (const word of keywords) {
      if (lowerDoc.includes(word)) {
        score += 1;
      }
    }

    // phrase boost
    if (lowerDoc.includes(issue.slice(0, 20))) {
      score += 3;
    }

    if (score > maxScore) {
      maxScore = score;
      bestDoc = doc;
    }
  }

  // 🚨 IMPORTANT: if still weak match → return empty
  if (maxScore < 2) {
    return "";
  }

  return bestDoc.slice(0, 400);
}



fs.createReadStream("../support_tickets/support_tickets.csv")   
    .pipe(csv())
    .on("data", (row) => tickets.push(row))
    .on("end", async () => {
        console.log("Loaded:", tickets.length);

        const results = [];

        const corpusDocs = loadCorpus();

        for(const ticket of tickets) {
            const issue =
                (ticket.issue ||
                    ticket.Issue ||
                    ticket["issue"] ||
                    ticket["Issue"] ||
                    "").toLowerCase();
            console.log("ROW:", ticket);
            const company = ticket.company || "";

            const context = retrieveRelevantDocs(issue, corpusDocs)

            //request type
            let request_type = "product_issue";
            if(issue.includes("error") || issue.includes("not working"))
                request_type = "bug";
            else if (issue.includes("feature"))
                request_type = "feature_request";


            //status 
            let status = "replied";
            if (
                issue.includes("fraud") ||
                issue.includes("charged") ||
                issue.includes("unauthorized") ||
                issue.includes("payment")
            ) {
                status = "escalated";
            }

            //product area
            let product_area = "general";
            if (company === "Visa" || issue.includes("card"))
                product_area = "payments";
            else if (company === "HackerRank")
                product_area = "assessments";
            else if (company === "Claude")
                product_area = "api";

            // response
            let response;
            let justification;

            if (status === "escalated") {
                response =
                    "This issue involves sensitive information and has been escalated to a human support agent.";
                justification =
                    "Escalated due to sensitive issue (fraud/payment/account access)";
            } else if (!context) {
                response =
                    "We could not find relevant information in our support documentation. This case has been escalated for further review.";
                status = "escalated";
                justification = "No relevant support documentation found";
            } else {
                response = `Here’s what we found:\n${context}`;
                justification =
                    "Response generated using retrieved support documentation from corpus";
            }


            console.log("ISSUE:", issue);
            console.log("CONTEXT LENGTH:", context.length);

            results.push({
                status,
                product_area,
                response,
                justification,
                request_type,
            });


            //log
            fs.appendFileSync(
                "../log.txt",
                `Issue: ${issue}\nStatus: ${status}\n---\n`
            );
        }   

        //writes CSV
        const writer = createObjectCsvWriter({
            path: "../support_tickets/output.csv",
            header: [
                { id: "status", title: "status" },
                { id: "product_area", title: "product_area" },
                { id: "response", title: "response" },
                { id: "justification", title: "justification" },
                { id: "request_type", title: "request_type" },
            ],
        });

        await writer.writeRecords(results);
        console.log("Done! output.csv generated");
    })