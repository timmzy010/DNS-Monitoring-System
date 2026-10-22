const domainInput = document.getElementById("domainInput");
const checkButton = document.getElementById("checkButton");
const message = document.getElementById("message");

const resultDomain = document.getElementById("resultDomain");
const resultStatus = document.getElementById("resultStatus");
const resultIp = document.getElementById("resultIp");
const resultTime = document.getElementById("resultTime");

checkButton.addEventListener("click", checkDomain);

domainInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        checkDomain();
    }
});

async function checkDomain() {
    let rawDomain = domainInput.value.trim();

    if (rawDomain === "") {
        message.textContent = "Please enter a domain name.";
        message.className = "error";
        return;
    }

    // Clean input: remove http://, https://, and any trailing paths
    const domain = rawDomain
        .replace(/^https?:\/\//i, '')
        .replace(/\/.*$/, '')
        .trim();

    message.textContent = "Checking domain...";
    message.className = "loading";

    resultDomain.textContent = domain;
    resultStatus.textContent = "---";
    resultStatus.className = "";
    resultIp.textContent = "---";
    resultTime.textContent = "---";

    const startTime = performance.now();

    try {
        const response = await fetch(
            "https://dns.google/resolve?name=" +
            encodeURIComponent(domain) +
            "&type=A"
        );

        if (!response.ok) {
            throw new Error("DNS service error");
        }

        const data = await response.json();
        const endTime = performance.now();
        const responseTime = Math.round(endTime - startTime);

        // Check if DNS status is NOERROR (0) and answers exist
        if (data.Status === 0 && data.Answer && data.Answer.length > 0) {
            // Find the A record (type 1) or fall back to the first available answer
            const aRecord = data.Answer.find((ans) => ans.type === 1);
            const ipAddress = aRecord ? aRecord.data : data.Answer[0].data;

            resultStatus.textContent = "ONLINE";
            resultStatus.className = "online";
            resultIp.textContent = ipAddress;
            resultTime.textContent = responseTime + " ms";

            message.textContent = "Domain resolved successfully.";
            message.className = "success";
        } else {
            showOfflineResult(responseTime);
        }

    } catch (error) {
        const endTime = performance.now();
        const responseTime = Math.round(endTime - startTime);

        resultStatus.textContent = "OFFLINE";
        resultStatus.className = "offline";
        resultIp.textContent = "Not found";
        resultTime.textContent = responseTime + " ms";

        message.textContent = "The domain could not be resolved.";
        message.className = "error";
    }
}

function showOfflineResult(responseTime) {
    resultStatus.textContent = "OFFLINE";
    resultStatus.className = "offline";
    resultIp.textContent = "Not found";
    resultTime.textContent = responseTime + " ms";

    message.textContent = "No DNS record was found.";
    message.className = "error";
}