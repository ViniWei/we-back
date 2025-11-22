from flask import Flask, jsonify, request, render_template_string
import speech_recognition as sr
import tempfile
import os
import requests

BACKEND_URL = "http://localhost:3000/voice/process"

app = Flask(__name__)
recognizer = sr.Recognizer()


@app.route("/voice/upload", methods=["POST"])
def recognize_uploaded_audio():
    # Não valida/obriga JWT aqui; apenas repassa se vier
    auth_header = request.headers.get("Authorization")

    if "audio" not in request.files:
        return jsonify({"error": "Audio file not found"}), 400

    file = request.files["audio"]
    temp_path = None

    try:
        # Salva o arquivo temporariamente
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp:
            file.save(temp.name)
            temp_path = temp.name

        # Reconhecimento de voz
        with sr.AudioFile(temp_path) as source:
            audio_data = recognizer.record(source)

        recognized_text = recognizer.recognize_google(audio_data, language="pt-BR")
        print(f"Recognized command: {recognized_text}")

        try:
            # Envia o texto e repassa o Authorization (se existir)
            headers = {}
            if auth_header:
                headers["Authorization"] = auth_header

            node_response = requests.post(
                BACKEND_URL,
                json={
                    "text": recognized_text
                },
                headers=headers,
                timeout=10
            )

            if node_response.status_code != 200:
                print(f"Node.js backend error: {node_response.text}")
                return jsonify({
                    "recognized": recognized_text,
                    "error": "Error processing request on Node backend."
                }), 500

            node_data = node_response.json()

        except Exception as e:
            print(f"Error connecting to Node backend: {e}")
            return jsonify({
                "recognized": recognized_text,
                "error": "Failed to connect to Node backend."
            }), 500

        return jsonify({
            "recognized": recognized_text,
            "node_response": node_data
        }), 200

    except sr.UnknownValueError:
        return jsonify({"error": "Unable to understand the audio."}), 400
    except sr.RequestError:
        return jsonify({"error": "Speech recognition service error."}), 500
    except Exception as e:
        print(f"Audio processing error: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass


@app.route("/", methods=["GET"])
def home():
    html = """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Voice Recognition - Flask API</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                text-align: center;
                margin-top: 80px;
            }
            button {
                font-size: 18px;
                padding: 10px 30px;
                cursor: pointer;
                background-color: #0066cc;
                color: white;
                border: none;
                border-radius: 6px;
            }
            button.stop { background-color: #cc0000; }
            input {
                margin-top: 20px;
                padding: 8px;
                width: 320px;
                font-size: 16px;
            }
            p { font-size: 16px; }
        </style>
    </head>
    <body>
        <h2>Voice Recognition Test</h2>
        <p>Enter your JWT token below:</p>
        <input id="tokenInput" placeholder="Paste your JWT token here" />
        <p>Click the button to start or stop recording:</p>
        <button id="recordBtn">Start Recording</button>
        <p id="status"></p>

        <script>
            let mediaRecorder;
            let audioChunks = [];
            let isRecording = false;

            const btn = document.getElementById("recordBtn");
            const status = document.getElementById("status");
            const tokenInput = document.getElementById("tokenInput");

            async function startRecording() {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    mediaRecorder = new MediaRecorder(stream);
                    audioChunks = [];
                    mediaRecorder.start();
                    status.textContent = "Recording...";
                    btn.textContent = "Stop";

                    mediaRecorder.ondataavailable = e => audioChunks.push(e.data);

                    mediaRecorder.onstop = async () => {
                        const blob = new Blob(audioChunks, { type: "audio/webm" });
                        const arrayBuffer = await blob.arrayBuffer();

                        const audioContext = new AudioContext();
                        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
                        const wavBuffer = audioBufferToWav(audioBuffer);
                        const wavBlob = new Blob([wavBuffer], { type: "audio/wav" });

                        const formData = new FormData();
                        formData.append("audio", wavBlob, "voice.wav");

                        const token = tokenInput.value.trim();
                        if (!token) {
                            status.textContent = "JWT token is required.";
                            return;
                        }

                        status.textContent = "Sending to server...";
                        const res = await fetch("/voice/upload", {
                            method: "POST",
                            headers: { "Authorization": "Bearer " + token },
                            body: formData
                        });

                        const data = await res.json();
                        status.textContent = data.recognized
                            ? "Recognized: " + data.recognized
                            : data.error || "Unknown error";
                    };
                } catch (err) {
                    console.error("Microphone access error:", err);
                    status.textContent = "Error accessing microphone.";
                }
            }

            function stopRecording() {
                mediaRecorder.stop();
                status.textContent = "Processing...";
                btn.textContent = "Start Recording";
            }

            btn.addEventListener("click", () => {
                if (!isRecording) {
                    startRecording();
                    btn.classList.add("stop");
                } else {
                    stopRecording();
                    btn.classList.remove("stop");
                }
                isRecording = !isRecording;
            });

            function audioBufferToWav(buffer) {
                const numOfChan = buffer.numberOfChannels;
                const length = buffer.length * numOfChan * 2 + 44;
                const result = new ArrayBuffer(length);
                const view = new DataView(result);
                const channels = [];
                let sample;
                let offset = 0;
                let pos = 0;

                function setUint16(data) { view.setUint16(pos, data, true); pos += 2; }
                function setUint32(data) { view.setUint32(pos, data, true); pos += 4; }

                setUint32(0x46464952);
                setUint32(length - 8);
                setUint32(0x45564157);
                setUint32(0x20746d66);
                setUint32(16);
                setUint16(1);
                setUint16(numOfChan);
                setUint32(buffer.sampleRate);
                setUint32(buffer.sampleRate * 2 * numOfChan);
                setUint16(numOfChan * 2);
                setUint16(16);
                setUint32(0x61746164);
                setUint32(length - pos - 4);

                for (let i = 0; i < numOfChan; i++) channels.push(buffer.getChannelData(i));

                while (pos < length) {
                    for (let i = 0; i < numOfChan; i++) {
                        sample = Math.max(-1, Math.min(1, channels[i][offset]));
                        view.setInt16(pos, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
                        pos += 2;
                    }
                    offset++;
                }
                return result;
            }
        </script>
    </body>
    </html>
    """
    return render_template_string(html)


if __name__ == "__main__":
    print("Flask voice server running at http://127.0.0.1:5001")
    app.run(host="0.0.0.0", port=5001, debug=True)
