import cats from "./catsData.js";

document.addEventListener("DOMContentLoaded", () => {
  let selectedCats = [];
  let answer = cats[Math.floor(Math.random() * cats.length)];

  function compareCategories(cat, answerCat) {
    const categories = [
      "rarity",
      "form",
      "role",
      "traits",
      "attackType",
      "abilities",
      "cost",
      "version",
    ];

    return categories.map((category) => {
      if (category === "form") {
        const validForms = [
          "Normal Form",
          "Evolved Form",
          "True Form",
          "Ultra Form",
        ];
        if (
          validForms.includes(cat[category]) &&
          validForms.includes(answerCat[category])
        ) {
          return cat[category] === answerCat[category] ? "green" : "red";
        }
      } else if (category === "cost" || category === "version") {
        const catValue = parseFloat(cat[category].replace(/[^0-9.]/g, ""));
        const answerValue = parseFloat(
          answerCat[category].replace(/[^0-9.]/g, "")
        );

        if (catValue === answerValue) {
          return "green";
        } else if (catValue < answerValue) {
          return "up";
        } else {
          return "down";
        }
      } else {
        const catValue = cat[category] || "";
        const answerValue = answerCat[category] || "";
        const catValues = catValue.split(" ");
        const answerValues = answerValue.split(" ");
        const commonElements = catValues.filter((value) =>
          answerValues.includes(value)
        );

        if (
          commonElements.length === catValues.length &&
          commonElements.length === answerValues.length
        ) {
          return "green";
        } else if (commonElements.length > 0) {
          return "yellow";
        }
      }
      return "red";
    });
  }

  function searchCats() {
    const searchBar = document.getElementById("search-bar");
    const resultsContainer = document.getElementById("results-container");
    const query = searchBar.value.toLowerCase();

    resultsContainer.innerHTML = "";

    if (query !== "") {
      resultsContainer.style.display = "block";
    } else {
      resultsContainer.style.display = "none";
      document.getElementById("search-button").onclick = null;
      return;
    }

    const filteredCats = cats.filter((cat) =>
      cat.name.toLowerCase().includes(query)
    );

    const allRelatedCats = [];
    filteredCats.forEach((cat) => {
      allRelatedCats.push(...cats.filter((c) => c.unitId === cat.unitId));
    });

    const uniqueCats = Array.from(
      new Set(allRelatedCats.map((a) => a.name))
    ).map((name) => {
      return allRelatedCats.find((a) => a.name === name);
    });

    uniqueCats.forEach((cat, index) => {
      const catElement = document.createElement("div");
      catElement.classList.add("cat-result");
      catElement.innerHTML = `
        <img src="${cat.img}" alt="${cat.name}" class="cat-img">
        <div class="cat-details">
          <p><strong>${cat.name}</strong></p>
        </div>
      `;
      catElement.addEventListener("click", () => {
        checkGuess(cat);
        selectedCats.push(cat.name);
        resultsContainer.innerHTML = "";
        searchBar.value = "";
        resultsContainer.style.display = "none";
      });
      resultsContainer.appendChild(catElement);

      if (index === 0) {
        document.getElementById("search-button").onclick = () => {
          if (!selectedCats.includes(cat.name)) {
            checkGuess(cat);
            selectedCats.push(cat.name);
            resultsContainer.innerHTML = "";
            searchBar.value = "";
            resultsContainer.style.display = "none";
          }
        };
      }
    });

    if (uniqueCats.length === 0) {
      document.getElementById("search-button").onclick = null;
    }
  }

  function checkGuess(cat) {
    displayCatDetails(cat);
    if (cat.name === answer.name) {
      displayGoodJobMessage();
    }
  }

  function displayCatDetails(cat) {
    const catDetailsContainer = document.getElementById(
      "cat-details-container"
    );
    const catDetailsElement = document.createElement("div");
    catDetailsElement.classList.add("cat-details-element");

    const colors = compareCategories(cat, answer);
    const categories = [
      "img",
      "rarity",
      "form",
      "role",
      "traits",
      "attackType",
      "abilities",
      "cost",
      "version",
    ];
    const categoryNames = [
      "Image",
      "Rarity",
      "Form",
      "Role",
      "Traits",
      "Attack Type",
      "Abilities",
      "Cost",
      "Version",
    ];

    catDetailsElement.innerHTML = categories
      .map((category, index) => {
        let color = "white";
        if (index > 0) {
          color = colors[index - 1];
        }
        if (category === "img") {
          return `<div class="cat-detail img-detail">
            <img src="${cat[category]}" alt="${cat.name}" class="cat-img">
          </div>`;
        } else if (
          category === "traits" ||
          category === "abilities" ||
          category === "attackType"
        ) {
          const images = cat[category]
            .split(" ")
            .map((value) => {
              const imagePath =
                value === "X"
                  ? `images/${category}/x.png`
                  : `images/${category}/${value.toLowerCase()}.webp`;
              return `<img src="${imagePath}" alt="${value}" class="trait-icon">`;
            })
            .join(" ");
          return `<div class="cat-detail trait-ability-detail" style="background-color: ${color};">
            <p>${images}</p>
          </div>`;
        } else if (category === "cost" || category === "version") {
          let indicator = "";
          if (color === "up") {
            indicator = '<span class="indicator up">▲</span>';
          } else if (color === "down") {
            indicator = '<span class="indicator down">▼</span>';
          }
          return `<div class="cat-detail text-detail" style="background-color: ${color};">
            <p>${cat[category]} ${indicator}</p>
          </div>`;
        } else {
          return `<div class="cat-detail text-detail" style="background-color: ${color};">
            <p>${cat[category]}</p>
          </div>`;
        }
      })
      .join("");

    catDetailsContainer.prepend(catDetailsElement);
  }

  function displayGoodJobMessage() {
    const messageContainer = document.createElement("div");
    messageContainer.classList.add("good-job-message");
    messageContainer.innerHTML = "<p>Good job! You guessed correctly!</p>";
    document.body.appendChild(messageContainer);

    setTimeout(() => {
      messageContainer.remove();
    }, 3000);
  }

  document.getElementById("search-bar").addEventListener("input", searchCats);
  document
    .getElementById("search-button")
    .addEventListener("click", searchCats);

  const searchBarOuter = document.querySelector(".search-bar-outer");
  const resultsContainer = document.getElementById("results-container");
  if (searchBarOuter && resultsContainer) {
    resultsContainer.style.width = `${searchBarOuter.offsetWidth}px`;
  }
});
