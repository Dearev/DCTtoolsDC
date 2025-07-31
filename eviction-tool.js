const REASONS = {
    "Eyesore": {
        "days": 14,
        "solution": "Review your build and address any points listed in the report. For tailored guidance, you may open a DCT ticket on Discord. Once changes are made, post screenshots in your eviction report to have it marked as 'solved by owner' and avoid eviction."
    },
    "Lack of Progress": {
        "days": 7,
        "solution": "Continue working on your build and ensure meaningful progress is made. Share screenshots in the report thread. Once progress is deemed significant (e.g., completed floor or shell), the report will be marked as 'solved by owner.' Keep progressing to prevent future reports."
    },
    "Non-Compliance": {
        "days": 14,
        "solution": "Update your build to meet zoning and thematic requirements. If you are unsure what needs to be corrected, open a DCT ticket for assistance. Once revised, post screenshots in the report thread to resolve the report."
    },
    "Inactivity": {
        "days": 7,
        "solution": "You have seven days to meet the minimum 6-hour playtime requirement. If you're unable to meet this due to valid reasons, you may request a deferral via the deferral request."
    }
};

const reasonSelect = document.getElementById('reason');
const daysLabel = document.getElementById('daysLabel');
const dateLabel = document.getElementById('dateLabel');
const copySolutionBtn = document.getElementById('copySolutionBtn');
const copyCommandBtn = document.getElementById('copyCommandBtn');

function updateDates() {
    const reason = reasonSelect.value;
    if (reason && REASONS[reason]) {
        const days = REASONS[reason].days;
        const today = new Date();
        const evictionDate = new Date(today.getTime() + days*24*60*60*1000);
        daysLabel.textContent = `Days to fix: ${days} days`;
        dateLabel.textContent = `Eviction Date: ${evictionDate.toISOString().split('T')[0]}`;
    } else {
        daysLabel.textContent = "Days to fix: ";
        dateLabel.textContent = "Eviction Date: ";
    }
}

reasonSelect.addEventListener('change', updateDates);

copySolutionBtn.addEventListener('click', function() {
    const reason = reasonSelect.value;
    if (!reason) {
        alert("Please select a reason first.");
        return;
    }
    const solution = REASONS[reason].solution;
    copyToClipboard(solution);
    alert("How to solve text copied to clipboard.");
});

copyCommandBtn.addEventListener('click', function() {
    const owner = document.getElementById('owner').value.trim();
    const plot = document.getElementById('plot').value.trim();
    const link = document.getElementById('link').value.trim();

    if (!owner || !plot || !link) {
        alert("Make sure Plot, Owner, and Report Link are filled in.");
        return;
    }

    const command = `/dct-eviction-notice ${owner} ${plot} ${link}`;
    copyToClipboard(command);
    alert("Eviction notice command copied to clipboard.");
});

function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
    } else {
        // Fallback for old browsers
        const tempInput = document.createElement("textarea");
        tempInput.value = text;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand("copy");
        document.body.removeChild(tempInput);
    }
}

// Initialize info on load
updateDates();