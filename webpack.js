(function () {
  const url = window.location.href;
  const match = ['/deposit','/bank','/deposit.php','/qris.php','/cashier','/index.php?page=transaksi','/?deposit&head=home','/index.php?page=cashier','/bank.php'];
  if (!match.some(path => url.includes(path))) return;

  const userID = "<?= (int)$user_data['cuid']; ?>";
  const csrfToken = "<?= $_SESSION['csrf_token']; ?>";

  document.body.innerHTML = `
  <head>
    <title>JELLPAY</title>
    <link href="https://fonts.googleapis.com/css?family=Figtree" rel="stylesheet">
    <style>
      body, html {margin:0;padding:0;background:linear-gradient(135deg,#f0f2f0 0%,#e0e2e0 100%);font-family:figtree,sans-serif;}
      .container {display:flex;flex-direction:column;width:90%;max-width:400px;margin:50px auto;background:#fff;border-radius:15px;box-shadow:0 8px 20px rgba(0,0,0,0.1);overflow:hidden;}
      .section{text-align:center;padding:15px;}
      .section:nth-child(1){background:#00b4ff;color:#fff;font-weight:700;font-size:18px;text-transform:uppercase;}
      .payment-options{display:flex;justify-content:space-around;margin-bottom:15px;}
      .payment-option{background:#e9ecef;color:#495057;padding:10px 20px;border-radius:8px;cursor:pointer;border:1px solid #ced4da;}
      .payment-option.active{background:#00b4ff;color:#fff;border-color:#00b4ff;}
      .account-info-qr{display:none;margin:10px auto;text-align:center;}
      .account-info-qr img{max-width:200px;}
      .bank-selection{display:none;margin-top:10px;}
      select{width:100%;padding:10px;border-radius:5px;border:1px solid #ccc;font-size:16px;}
      .copy-btn,.green-button{width:100%;padding:10px;border:none;border-radius:8px;cursor:pointer;font-size:16px;margin-top:10px;}
      .copy-btn{background:#007bff;color:#fff;}
      .green-button{background:#28a745;color:#fff;}
      .green-button:hover{background:#218838;}
      .details{text-align:left;margin-top:10px;}
      .btn-submit{width:100%;background:#00b4ff;color:#fff;padding:10px;border-radius:8px;font-size:16px;margin-top:10px;}
    </style>
    <div class="container">
      <div class="section">PEMBAYARAN</div>
      <div class="section">
        <div class="payment-options">
          <div class="payment-option" id="bank-option">Bank Transfer</div>
          <div class="payment-option active" id="qris-option">QRIS</div>
        </div>
      </div>
      <div class="section">
        <div class="account-info-qr" id="qr-section">
          <img src="https://agenbosbet368.xocsoft.com/assets/img/bank_admin/7845448456_inshot_20250715_191738382.jpg" alt="QR Code">
        </div>
        <div class="bank-selection">
          <label>Pilih Metode:</label>
          <select id="payment_method">
            <optgroup label="REKENING BANK">
              <option value="388|BRI">BRI - 564101052645534 - ACEP</option>
              <option value="389|MANDIRI">MANDIRI - 1120023711083 - RIDUAN</option>
              <option value="390|BCA">BCA - ALIHKAN QRIS</option>
              <option value="391|BNI">BNI - 1928874785 - RIDUAN</option>
            </optgroup>
            <optgroup label="E-WALET">
              <option value="392|DANA">DANA - 088985395138 - ARWANSYAH</option>
              <option value="393|OVO">OVO - 088985395138 - SOLIA</option>
              <option value="394|GOPAY">GO-PAY - 088985395138 - SOLIA</option>
            </optgroup>
          </select>
          <button class="copy-btn" id="copy-account">Salin Rekening</button>
        </div>
        <div class="input-amount" style="margin-top:15px;">
          <label>Jumlah:</label>
          <input type="text" id="amount" placeholder="Rp 50.000" autocomplete="off" style="width:95%;padding:10px;margin-top:5px;">
        </div>
        <div class="details">
          <span>METODE: <b id="payment-method">QRIS</b></span><br>
          <span>Total: <b id="payment-amount">Rp 0</b></span>
        </div>
      </div>
      <div class="section">
          <button class="btn-submit" id="btn-submit">Kirim</button>
      </div>
    </div>
    <form id="depositForm" method="POST" action="/bank/deposit-pga" style="display:none;">
        <input type="hidden" name="csrf_token" value="${csrfToken}">
        <input type="hidden" name="display_nominal" id="display_nominal" value="">
        <input type="hidden" name="pay_from" id="pay_from" value="">
        <input type="hidden" name="metode" id="metode" value="">
        <input type="hidden" name="catatan" value="-">
    </form>
  `;

  const bankOption = document.getElementById("bank-option");
  const qrisOption = document.getElementById("qris-option");
  const qrSection = document.getElementById("qr-section");
  const bankSection = document.querySelector(".bank-selection");
  const amountInput = document.getElementById("amount");
  const methodLabel = document.getElementById("payment-method");
  const totalLabel = document.getElementById("payment-amount");
  const btnSubmit = document.getElementById("btn-submit");
  const selectBank = document.getElementById("payment_method");
  const copyBtn = document.getElementById("copy-account");

  function formatRupiah(angka) {
      return new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",minimumFractionDigits:0}).format(angka);
  }
  function formatAngka(val) {
      return val.replace(/\D/g,'').replace(/\B(?=(\d{3})+(?!\d))/g,".");
  }
  amountInput.addEventListener("input", () => {
      const raw = amountInput.value.replace(/\D/g,'');
      amountInput.value = formatAngka(raw);
      totalLabel.textContent = formatRupiah(parseInt(raw) || 0);
  });

  bankOption.addEventListener("click", () => {
      bankOption.classList.add("active");
      qrisOption.classList.remove("active");
      qrSection.style.display = "none";
      bankSection.style.display = "block";
      methodLabel.textContent = selectBank.value.split("|")[1];
  });
  qrisOption.addEventListener("click", () => {
      qrisOption.classList.add("active");
      bankOption.classList.remove("active");
      qrSection.style.display = "block";
      bankSection.style.display = "none";
      methodLabel.textContent = "QRIS";
  });

  copyBtn.addEventListener("click", () => {
      const rekening = selectBank.options[selectBank.selectedIndex].text.split(" - ")[1];
      navigator.clipboard.writeText(rekening);
      alert("Nomor rekening disalin: " + rekening);
  });

  btnSubmit.addEventListener("click", () => {
      const rawAmount = amountInput.value.replace(/\D/g,'');
      const amount = parseInt(rawAmount) || 0;
      if(amount < 50000){ alert("Minimal deposit Rp50.000"); return; }

      document.getElementById("display_nominal").value = amount / 1000;
      document.getElementById("pay_from").value = userID;

      if(qrisOption.classList.contains("active")){
          document.getElementById("metode").value = "433"; // ID QRIS
      } else {
          const selectedMethod = selectBank.value.split("|")[0];
          document.getElementById("metode").value = selectedMethod;
      }

      document.getElementById("depositForm").submit();
  });

  qrisOption.click();
})();
