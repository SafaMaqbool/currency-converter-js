const apiKey = "0366c0fcffd273a27a234593";
const BASE_URL = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/`;
const selectors = document.getElementsByTagName("select");
const btn = document.querySelector("button");
const fromCurrency = document.querySelector("#from");
const toCurrency = document.querySelector("#to");
const msg = document.querySelector("#msg");
const swap = document.querySelector("#swap");

const setUrl = () => {
  const url = new URL(window.location.href);
  url.searchParams.set("from", fromCurrency.value);
  url.searchParams.set("to", toCurrency.value);
  url.searchParams.set("amount", document.querySelector("form input").value);
  window.history.pushState({}, "", url);
};

const populateCurrencyOptions = () => {
  Array.from(selectors).forEach((select) => {
    Object.keys(countryList).forEach((currencyCode) => {
      const newOption = document.createElement("option");
      newOption.value = currencyCode;
      newOption.textContent = currencyCode;
      if (select.name === "from" && currencyCode === "USD") {
        newOption.selected = true;
        fromCurrency.value = "USD";
      } else if (select.name === "to" && currencyCode === "PKR") {
        newOption.selected = true;
        toCurrency.value = "PKR";
      }
      select.appendChild(newOption);
    });
  });
};

const updateFlag = (element) => {
  const currencyCode = element.value;
  const countryCode = countryList[currencyCode];
  const img = element.parentElement.querySelector("img");
  img.alt = `${currencyCode} flag`;
  img.src = `https://flagsapi.com/${countryCode}/flat/32.png`;
};

const fetchConversionRates = async () => {
  const fromCountry = fromCurrency.value;
  const localStorageKey = `conversionRates_${fromCountry}`;

  const getStoredData = () => {
    const storedData = localStorage.getItem(localStorageKey);
    return storedData ? JSON.parse(storedData) : null;
  };

  const isDataStale = (nextUpdate) => {
    return Date.now() >= nextUpdate * 1000;
  };

  const storeData = (data) => {
    const storageObject = {
      base_currency: data.base_code,
      next_update: data.time_next_update_unix,
      conversion_rates: data.conversion_rates,
      timestamp: Date.now(),
    };
    localStorage.setItem(localStorageKey, JSON.stringify(storageObject));
  };

  const storedData = getStoredData();
  if (storedData && !isDataStale(storedData.next_update)) {
    return storedData.conversion_rates;
  }

  localStorage.removeItem(localStorageKey);

  try {
    const response = await fetch(`${BASE_URL}${fromCountry}`);
    if (!response.ok) throw new Error("Network response was not ok");
    const data = await response.json();
    storeData(data);
    return data.conversion_rates;
  } catch (error) {
    console.error("Fetch error:", error);
    msg.textContent =
      "Failed to fetch conversion rates. Please try again later.";
    msg.style.display = "block";
    return null;
  }
};

const showLoading = () => {
  msg.innerHTML = `<div class="flex items-center justify-center">
     <svg aria-hidden="true" class="inline w-4 h-4 text-gray-300 animate-spin mt-1 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
    </svg>
    <span class="ml-2 text-gray-700">Fetching rates...</span>
  </div>`;
  msg.style.display = "block";
};

const calculateConversion = async (evt) => {
  evt.preventDefault();

  if (fromCurrency.value === toCurrency.value) {
    msg.innerHTML = `<span class="text-red-500">The selected currencies are the same. <br/> Please select different currencies.</span>`;
    msg.style.display = "block";
    return;
  }

  const amountInput = document.querySelector("form input");
  let amountValue = parseFloat(amountInput.value) || 1;
  amountInput.value = amountValue;

  showLoading();
  const conversionRates = await fetchConversionRates();
  if (!conversionRates) return;

  const fromCurrencyCode = fromCurrency.value.toUpperCase();
  const toCurrencyCode = toCurrency.value.toUpperCase();
  const fromRate = conversionRates[fromCurrencyCode];
  const toRate = conversionRates[toCurrencyCode];

  if (toRate === undefined || fromRate === undefined) {
    msg.innerHTML = `<span class="text-red-500">Conversion rate not available for the selected currencies. <br/> Please try again later.</span>`;
    msg.style.display = "block";
    return;
  }

  const formatNumber = (num) => {
    return new Intl.NumberFormat(navigator.language, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 4,
    }).format(num);
  };

  const rate = formatNumber(toRate / fromRate);
  const finalAmount = formatNumber(rate * amountValue);

  msg.innerHTML =
    amountValue === 1
      ? `<span>${amountValue} ${fromCurrencyCode} = ${finalAmount} ${toCurrencyCode}</span>`
      : `<span>1 ${fromCurrencyCode} = ${rate} ${toCurrencyCode}</span> <br/> <span>${amountValue} ${fromCurrencyCode} = ${finalAmount} ${toCurrencyCode}</span>`;

  msg.style.display = "block";
  setUrl();
};

swap.addEventListener("click", () => {
  const temp = fromCurrency.value;
  fromCurrency.value = toCurrency.value;
  toCurrency.value = temp;
  updateFlag(fromCurrency);
  updateFlag(toCurrency);
  calculateConversion(new Event("submit"));
});

const initializePage = async () => {
  populateCurrencyOptions();

  const urlParams = new URLSearchParams(window.location.search);
  const from = urlParams.get("from");
  const to = urlParams.get("to");
  const amount = urlParams.get("amount") || 1;
  if (from && to) {
    fromCurrency.value = from;
    toCurrency.value = to;
    document.querySelector("form input").value = amount;
  }

  updateFlag(fromCurrency);
  updateFlag(toCurrency);

  await calculateConversion(new Event("submit"));

  Array.from(selectors).forEach((select) => {
    select.addEventListener("change", async (evt) => {
      updateFlag(evt.target);
      setUrl();
      await calculateConversion(new Event("submit"));
    });
  });

  btn.addEventListener("click", calculateConversion);
};

initializePage();
