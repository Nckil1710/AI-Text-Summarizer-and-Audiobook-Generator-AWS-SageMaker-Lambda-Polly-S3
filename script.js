document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("textForm");
    const fileInput = document.getElementById("fileInput");
    const textInput = document.getElementById("textInput");
    const summarizeCheckbox = document.getElementById("summarizeCheckbox");
    const textToSpeechCheckbox = document.getElementById("textToSpeechCheckbox");
    const maxLengthInput = document.getElementById("maxLength");
    const minLengthInput = document.getElementById("minLength");
    const voiceSelect = document.getElementById("voiceSelect");
    const engineSelect = document.getElementById("engineSelect");
    const outputText = document.getElementById("outputText");
    const audioPlayer = document.getElementById("audioPlayer");
    const audioSource = document.getElementById("audioSource");
    const downloadButton = document.getElementById("downloadButton");

    summarizeCheckbox.addEventListener("change", function () {
        document.getElementById("summarizationOptions").style.display = this.checked ? "block" : "none";
    });

    textToSpeechCheckbox.addEventListener("change", function () {
        document.getElementById("ttsOptions").style.display = this.checked ? "block" : "none";
    });

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const file = fileInput.files[0];
        let textContent = textInput.value.trim();
        
        if (file) {
            const reader = new FileReader();
            reader.onload = async function () {
                textContent = reader.result.trim();
                await processText(textContent);
            };
            reader.readAsText(file);
        } else if (textContent !== "") {
            await processText(textContent);
        } else {
            alert("Please upload a file or enter text.");
        }
    });

    async function processText(textContent) {
        let finalText = textContent;

        if (summarizeCheckbox.checked) {
            finalText = await summarizeText(finalText);
            outputText.innerText = "Summarized Text: " + finalText;
        }

        if (textToSpeechCheckbox.checked) {
            await convertToSpeech(finalText);
        }
    }

    async function summarizeText(text) {
        try {
            const maxLength = maxLengthInput.value.trim(); // Remove any spaces
            const minLength = minLengthInput.value.trim();
    
            if (!maxLength || !minLength || isNaN(maxLength) || isNaN(minLength)) {
                console.error("Invalid input: max_length or min_length is not a valid number.");
                alert("Please enter valid numbers for max and min length.");
                return;
            }
    
            // Ensure numeric values
            const parsedMaxLength = parseInt(maxLength, 10);
            const parsedMinLength = parseInt(minLength, 10);
    
            if (parsedMinLength > parsedMaxLength) {
                console.error("Validation error: min_length cannot be greater than max_length.");
                alert("Min length cannot be greater than max length.");
                return;
            }
    
            const formData = new FormData();
            formData.append("text", text);
            formData.append("max_length", parsedMaxLength);
            formData.append("min_length", parsedMinLength);
    
            // Debug: Log the FormData values
            console.log("Sending FormData:");
            for (let pair of formData.entries()) {
                console.log(pair[0], ":", pair[1]);
            }
    
            const response = await fetch("https://crmahrj8q6.execute-api.us-east-1.amazonaws.com/default/summarizer", {
                method: "POST",
                body: formData,
            });
    
            // Debug: Log the response status
            console.log("Response status:", response.status);
    
            if (!response.ok) {
                const errorText = await response.text(); // Get response error text
                console.error("HTTP Error Response:", errorText);
                throw new Error(`HTTP error! Status: ${response.status} - ${errorText}`);
            }
    
            const result = await response.json();
            console.log("Received response:", result);
    
            return result.summary_text || "Summarization failed";
        } catch (error) {
            console.error("Summarization failed:", error);
            return "Summarization failed";
        }
    }
    

    async function convertToSpeech(text) {
        try {
            const formData = new FormData();
            const blob = new Blob([text], { type: "text/plain" });
            const tempFile = new File([blob], "text.txt", { type: "text/plain" });

            formData.append("file", tempFile);
            formData.append("voice", voiceSelect.value);
            formData.append("engine", engineSelect.value);

            const response = await fetch("https://lywzuyluh2.execute-api.us-east-1.amazonaws.com/default/text-to-speech", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const result = await response.json();

            if (result.audio_url) {
                audioSource.src = result.audio_url;
                audioPlayer.style.display = "block";
                audioPlayer.load();
                downloadButton.href = result.audio_url;
                downloadButton.style.display = "block";
            } else {
                alert("Text-to-Speech conversion failed.");
            }
        } catch (error) {
            console.error("Text-to-Speech Error:", error);
        }
    }
});
