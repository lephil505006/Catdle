import cats from "./catsData.js";

document.addEventListener("DOMContentLoaded", () => {
  let selectedCats = [];
  let answer = cats.find((cat) => cat.name === "The Grateful Crane");

  function compareCategories(cat, answerCat) {
    const categories = [
      "rarity",
      "form",
      "source",
      "role",
      "traits",
      "abilities",
      "cost",
      "version",
    ];
    return categories.map((category) => {
      const catValues = cat[category].split(" ");
      const answerValues = answerCat[category].split(" ");
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
      return "red";
    });
  }

  function searchCats() {
    const searchBar = document.getElementById("search-bar");
    const resultsContainer = document.getElementById("results-container");
    const query = searchBar.value.toLowerCase();

    // Clear previous results
    resultsContainer.innerHTML = "";

    // Clear results if search bar is empty
    if (query === "") {
      resultsContainer.innerHTML = "";
      document.getElementById("search-button").onclick = null;
      return;
    }

    // Filter cats
    const filteredCats = cats.filter(
      (cat) =>
        cat.name.toLowerCase().includes(query) &&
        !selectedCats.includes(cat.name)
    );

    // Display results
    filteredCats.forEach((cat, index) => {
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
      });
      resultsContainer.appendChild(catElement);

      if (index === 0) {
        document.getElementById("search-button").onclick = () => {
          if (!selectedCats.includes(cat.name)) {
            checkGuess(cat);
            selectedCats.push(cat.name);
            resultsContainer.innerHTML = "";
            searchBar.value = "";
          }
        };
      }
    });

    if (filteredCats.length === 0) {
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
      "source",
      "role",
      "traits",
      "abilities",
      "cost",
      "version",
    ];
    const categoryNames = [
      "Image",
      "Rarity",
      "Form",
      "Source",
      "Role",
      "Traits",
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
        } else if (category === "traits" || category === "abilities") {
          const images = cat[category]
            .split(" ")
            .map((value) => {
              const imagePath =
                value === "X"
                  ? `images/${category}/x.png`
                  : `images/${category}/${value.toLowerCase()}.webp`;
              const imageClass = value === "X" ? "trait-icon" : "trait-icon";
              return `<img src="${imagePath}" alt="${value}" class="${imageClass}">`;
            })
            .join(" ");
          return `<div class="cat-detail trait-ability-detail" style="background-color: ${color};">
                <p>${images}</p>
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
});
