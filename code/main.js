const fs = require("fs");
const csv = require("csv-parser");
const { createObjectCsvWriter } = require("csv-writer");

const tickets = [];

fs.createReadStream("../support_tickets/support_tickets.csv")   
    .pipe(csv())
    .on("data", (row) => tickets.push(row))
    .on("end", async () => {
        console.log("Loaded:", tickets.length);

        const results = [];


        for(const ticket of tickets) {
            const issue = (ticket.issue || "").toLowerCase();
            const company = ticket.company || "";

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
            let response =
                status === "escalated"
                ? "This issue requires human support due to its sensitive nature."
                : "We have received your request and will assist you.";

            // justification
            let justification =
                status === "escalated"
                ? "Sensitive keywords detected (payment/fraud)"
                : "Handled as general support query";

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