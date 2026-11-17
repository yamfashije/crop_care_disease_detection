
import React, { useEffect, useState } from "react";
import "./CropDetection.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function CropDetection({ onDetectionComplete }) {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!image) {
      setPreview("");
      return;
    }

    const imageUrl = URL.createObjectURL(image);
    setPreview(imageUrl);

    return () => URL.revokeObjectURL(imageUrl);
  }, [image]);

  function handleImageChange(event) {
    const selectedImage = event.target.files?.[0];

    setError("");
    setResult(null);
    setImage(null);

    if (!selectedImage) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(selectedImage.type)) {
      setError("Hitamo ifoto ya JPG, PNG cyangwa WEBP.");
      event.target.value = "";
      return;
    }

    if (selectedImage.size > 10 * 1024 * 1024) {
      setError("Ifoto ntigomba kurenza 10 MB.");
      event.target.value = "";
      return;
    }

    setImage(selectedImage);
  }

  async function handleDetection() {
    if (!image) {
      setError("Banza uhitemo ifoto y'igihingwa.");
      return;
    }

    const token = localStorage.getItem("cropcare_token");

    if (!token) {
      setError("Ongera winjire muri konti yawe.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const formData = new FormData();
      formData.append("image", image);

      const response = await fetch(`${API_URL}/crops/detect`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Gusuzuma ifoto byanze."
        );
      }

      if (!data.result) {
        throw new Error("Backend ntiyagaruye igisubizo cya AI.");
      }

      setResult(data.result);

      if (onDetectionComplete) {
        onDetectionComplete(data.result);
      }

    } catch (err) {
      setError(
        err.message || "Habaye ikibazo mu gusuzuma igihingwa."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleRemoveImage() {
    setImage(null);
    setPreview("");
    setResult(null);
    setError("");

    const input = document.getElementById("crop-image");

    if (input) input.value = "";
  }

  const confidence = Math.min(
    100,
    Math.max(0, Number(result?.confidence || 0))
  );

  return (
    <div className="crop-detection-container">

      <div className="crop-detection-header">
        <h2>🌿 Upload Crop Image</h2>
        <p>
          Hitamo ifoto isobanutse y'ikibabi cyangwa igihingwa
          kugira ngo AI ishobore kugisuzuma.
        </p>
      </div>

      <div className="crop-upload-box">

        <label htmlFor="crop-image" className="crop-upload-label">
          <div className="crop-upload-icon">📸</div>

          <h3>Hitamo ifoto y'igihingwa</h3>

          <p>
            Kanda hano uhitemo ifoto muri mudasobwa yawe.
          </p>

          <span className="crop-file-types">
            JPG • PNG • WEBP | Maximum 10 MB
          </span>
        </label>

        <input
          id="crop-image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleImageChange}
          hidden
        />

        {preview && (
          <div className="crop-image-preview">
            <img src={preview} alt="Crop preview" />

            <div className="crop-file-name">
              📄 {image?.name}
            </div>

            <button
              type="button"
              className="remove-image-btn"
              onClick={handleRemoveImage}
              disabled={loading}
            >
              ✕ Kuraho ifoto
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={handleDetection}
          disabled={loading || !image}
          className="crop-detect-button"
        >
          {loading ? (
            <span className="loading-content">
              <span className="ai-spinner"></span>
              AI irimo gusuzuma...
            </span>
          ) : (
            "🔍 Suzuma indwara"
          )}
        </button>

      </div>

      {error && (
        <div className="crop-error" role="alert">
          ⚠️ {error}
        </div>
      )}

      {result && (
        <div className="crop-result">

          <div className="result-header">
            <span className="success-icon">✓</span>
            <div>
              <h2>AI Detection Results</h2>
              <p>Gusuzuma ifoto byarangiye.</p>
            </div>
          </div>

          <div className="result-details">

            <div className="result-item">
              <span>🌱 Igihingwa</span>
              <strong>{result.crop_name || "Ntabwo kizwi"}</strong>
            </div>

            <div className="result-item">
              <span>🦠 Indwara</span>
              <strong>{result.disease || "Ntabwo izwi"}</strong>
            </div>

          </div>

          <div className="confidence-section">
            <div className="confidence-heading">
              <strong>AI Confidence</strong>
              <strong>{confidence.toFixed(2)}%</strong>
            </div>

            <div className="confidence-track">
              <div
                className="confidence-fill"
                style={{ width: `${confidence}%` }}
              />
            </div>
          </div>

          <div className="recommendation-box">
            <h3>💡 Inama za AI</h3>
            <p>
              {result.recommendation || "Nta nama yatanzwe."}
            </p>
          </div>

          <p className="history-success">
            ✓ Ibisubizo byagarutse kuri dashboard.
          </p>

          <p className="ai-disclaimer">
            Icyitonderwa: Ibisubizo bya AI ni ubufasha mu
            kumenya indwara. Iyo utizeye igisubizo, baza
            umuhanga mu buhinzi.
          </p>

        </div>
      )}

    </div>
  );
}

export default CropDetection;
