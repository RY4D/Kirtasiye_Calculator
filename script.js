/* ============================================================
   Kırtasiye Fiyat Hesaplama - Mantık Dosyası
   ============================================================ */

/* ---- Yapılandırma (isterseniz buradan değiştirin) ---- */

// Varsayılan KDV oranı (%) - formdaki value(input) ile eşleşir
const DEFAULT_KDV = 20;

// Varsayılan hedef kâr marjı (%) - formdaki value(input) ile eşleşir
const DEFAULT_MARGIN = 20;

// Karşılaştırma bölümünde gösterilecek farklı kâr marjları (%)
const COMPARISON_MARGINS = [10, 15, 20, 25, 30, 40, 50];

/* ---- Para biçimlendirme ----
   Türk Lirası formatı "150,00 TL".
   Sembolü veya ondalık ayracı değiştirmek isterseniz burayı düzenleyin. */
function formatTL(value) {
  // en-GB: Türkçe tarzı "1.234,56" gruplama/ayraç, ardından "TL" eklenir
  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value) + " TL";
}

function formatPercent(value) {
  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value) + "%";
}

/* ---- DOM bağlantıları ---- */
const buyingInput = document.getElementById("buyingPrice");
const kdvInput = document.getElementById("kdvRate");
const marginInput = document.getElementById("profitMargin");
const calcBtn = document.getElementById("calculateBtn");
const errorMsg = document.getElementById("errorMsg");
const resultsBox = document.getElementById("results");
const comparisonBody = document.getElementById("comparisonBody");

/* ---- Hesaplama formülleri ----
   Kâr yüzdesi BİR MARJ'dır (mark-up değil).
   Satış Fiyatı (KDV Hariç) = Alış / (1 - Marj / 100) */
function calculate(buyingPrice, kdvRate, profitMargin) {
  const priceBeforeKdv = buyingPrice / (1 - profitMargin / 100); // Satış fiyatı (KDV hariç)
  const grossProfit = priceBeforeKdv - buyingPrice;              // Brüt kâr
  const salesKdv = priceBeforeKdv * (kdvRate / 100);             // Satış KDV
  const finalPrice = priceBeforeKdv + salesKdv;                  // Müşteri satış fiyatı
  return { priceBeforeKdv, grossProfit, salesKdv, finalPrice };
}

/* ---- Doğrulama ---- */
function validate(buyingPrice, kdvRate, profitMargin) {
  // Boş değer kontrolü
  if (buyingPrice === "" || kdvRate === "" || profitMargin === "") {
    return "Lütfen tüm alanları doldurun.";
  }

  // Sayısal değilse HESAPLA'madan önce kontrol
  if (isNaN(buyingPrice) || isNaN(kdvRate) || isNaN(profitMargin)) {
    return "Lütfen geçerli bir sayı girin.";
  }

  if (buyingPrice < 0) {
    return "Alış fiyatı negatif olamaz.";
  }

  if (kdvRate < 0) {
    return "KDV oranı negatif olamaz.";
  }

  if (profitMargin < 0) {
    return "Kâr marjı negatif olamaz.";
  }

  if (profitMargin >= 100) {
    return "Kâr marjı %100'den küçük olmalıdır.";
  }

  return null; // geçerli
}

/* ---- Sonuçları göster ---- */
function renderResults(buyingPrice, kdvRate, profitMargin) {
  const r = calculate(buyingPrice, kdvRate, profitMargin);

  document.getElementById("resPriceBeforeKdv").textContent = formatTL(r.priceBeforeKdv);
  document.getElementById("resSalesKdv").textContent = formatTL(r.salesKdv);
  document.getElementById("resGrossProfit").textContent = formatTL(r.grossProfit);
  document.getElementById("resGrossMargin").textContent = formatPercent(profitMargin);
  document.getElementById("resFinalPrice").textContent = formatTL(r.finalPrice);

  resultsBox.hidden = false;
}

/* ---- Karşılaştırma tablosunu güncelle ---- */
function renderComparison(buyingPrice, kdvRate) {
  comparisonBody.innerHTML = "";

  COMPARISON_MARGINS.forEach(function (margin) {
    const r = calculate(buyingPrice, kdvRate, margin);
    const tr = document.createElement("tr");

    const tdMargin = document.createElement("td");
    tdMargin.textContent = "%" + margin;

    const tdPrice = document.createElement("td");
    tdPrice.textContent = formatTL(r.finalPrice);

    tr.appendChild(tdMargin);
    tr.appendChild(tdPrice);
    comparisonBody.appendChild(tr);
  });
}

/* ---- Hesapla butonu ---- */
function handleCalculate() {
  const buyingPrice = parseFloat(buyingInput.value);
  const kdvRate = parseFloat(kdvInput.value);
  const profitMargin = parseFloat(marginInput.value);

  const error = validate(buyingInput.value, kdvInput.value, marginInput.value);

  if (error) {
    errorMsg.textContent = error;
    errorMsg.hidden = false;
    resultsBox.hidden = true;
    comparisonBody.innerHTML = "";
    return;
  }

  errorMsg.hidden = true;
  renderResults(buyingPrice, kdvRate, profitMargin);
  renderComparison(buyingPrice, kdvRate);
}

calcBtn.addEventListener("click", handleCalculate);

/* Girdiler değiştiğinde hata mesajını temizle */
[buyingInput, kdvInput, marginInput].forEach(function (input) {
  input.addEventListener("input", function () {
    errorMsg.hidden = true;
  });
});
