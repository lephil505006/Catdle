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
          return cat[category] === answerCat[category]
            ? "green-box"
            : "red-box";
        }
      } else if (category === "cost" || category === "version") {
        const catValue = parseFloat(cat[category].replace(/[^\d.-]/g, ""));
        const answerValue = parseFloat(
          answerCat[category].replace(/[^\d.-]/g, "")
        );

        if (catValue === answerValue) {
          return "green-box";
        }

        let arrowClass = "";
        if (!isNaN(catValue) && !isNaN(answerValue)) {
          if (category === "cost") {
            if (Math.abs(catValue - answerValue) > 1500) {
              arrowClass = catValue > answerValue ? "double-down" : "double-up";
            } else {
              arrowClass = catValue > answerValue ? "single-down" : "single-up";
            }
          } else if (category === "version") {
            if (Math.abs(catValue - answerValue) >= 5) {
              arrowClass = catValue > answerValue ? "double-down" : "double-up";
            } else {
              arrowClass = catValue > answerValue ? "single-down" : "single-up";
            }
          }
        }

        return arrowClass || "red-box";
      } else if (category === "abilities" || category === "traits") {
        const catValue = cat[category] || "";
        const answerValue = answerCat[category] || "";
        const catValues = catValue.split(" ");
        const answerValues = answerValue.split(" ");
        const commonElements = catValues.filter((value) =>
          answerValues.includes(value)
        );

        if (
          commonElements.length > 0 &&
          commonElements.length < answerValues.length
        ) {
          return "yellow-box";
        } else if (
          commonElements.length === catValues.length &&
          commonElements.length === answerValues.length
        ) {
          return "green-box";
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
          return "green-box";
        } else if (commonElements.length > 0) {
          return "yellow-box";
        }
      }
      return "red-box";
    });
  }

  function searchCats() {
    const searchBar = document.getElementById("search-bar");
    const resultsContainer = document.getElementById("results-container");
    const query = searchBar.value.toLowerCase();

    resultsContainer.innerHTML = "";

    if (query !== "") {
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

      const validCats = uniqueCats.filter(
        (cat) => !selectedCats.includes(cat.name)
      );

      if (validCats.length > 0) {
        resultsContainer.style.display = "block";
        validCats.forEach((cat, index) => {
          const catElement = document.createElement("div");
          catElement.classList.add("cat-result");
          catElement.innerHTML = `
          <img src="${cat.img}" alt="${cat.name}" class="search-cat-img">
          <div class="cat-details">
              <p><strong>${cat.name}</strong></p>
          </div>
        `;
          catElement.addEventListener("click", () => {
            if (!selectedCats.includes(cat.name)) {
              checkGuess(cat);
              selectedCats.push(cat.name);
              resultsContainer.innerHTML = "";
              searchBar.value = "";
              resultsContainer.style.display = "none";
            }
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
      } else {
        // Display "No Cat Found" message if invalid entry
        const noCatElement = document.createElement("div");
        noCatElement.classList.add("cat-result");
        noCatElement.style.textAlign = "center";
        noCatElement.style.color = "#000";
        noCatElement.style.pointerEvents = "none";
        noCatElement.innerHTML = "<p><strong>No Cat Found</strong></p>";
        resultsContainer.appendChild(noCatElement);
        resultsContainer.style.display = "block";

        // Disable Play button
        document.getElementById("search-button").onclick = null;
      }
    } else {
      resultsContainer.style.display = "none";
      searchBar.placeholder = "Enter cat name...";
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
    const headers = document.getElementById("headers");

    if (headers.style.display === "none") {
      headers.style.display = "flex";
    }

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

    const detailsHTML = categories
      .map((category, index) => {
        let colorClass = "white-box";
        if (index > 0) {
          colorClass = colors[index - 1];
        }
        if (category === "img") {
          return `<div class="cat-img-container">
                            <img src="${cat[category]}" alt="${cat.name}" class="cat-img">
                        </div>`;
        } else if (category === "traits") {
          const traits = cat[category].split(" ");
          let fontSizeClass = "";
          if (traits.length > 6) {
            fontSizeClass = "small-font";
          }
          const images = traits
            .map((value) => {
              const imagePath =
                value === "X"
                  ? `images/${category}/x.png`
                  : `images/${category}/${value.toLowerCase()}.webp`;
              return `<img src="${imagePath}" alt="${value}" class="trait-icon">`;
            })
            .join(" ");
          return `<div class="cat-detail ${colorClass} ${fontSizeClass}">
                            <div class="traits-container">${images}</div>
                        </div>`;
        } else if (category === "attackType") {
          const attackTypes = cat[category].split(" ");
          const images = attackTypes
            .map((type) => {
              const imagePath = `images/attackType/${type.toLowerCase()}.webp`;
              return `<img src="${imagePath}" alt="${type}" class="attack-type-icon">`;
            })
            .join(" ");
          return `<div class="cat-detail ${colorClass}">
                            <div class="attack-type-container">${images}</div>
                        </div>`;
        } else if (category === "abilities") {
          const abilities = cat[category].split(" ");
          const images = abilities
            .map((value) => {
              const imagePath =
                value === "X"
                  ? `images/${category}/x.png`
                  : `images/${category}/${value.toLowerCase()}.webp`;
              return `<img src="${imagePath}" alt="${value}" class="trait-icon">`;
            })
            .join(" ");
          return `<div class="cat-detail ${colorClass}">
                            <div class="traits-container">${images}</div>
                        </div>`;
        } else {
          return `<div class="cat-detail ${colorClass}">
                            <p>${cat[category]} ${
            category === "cost"
              ? '<span class="indicator ' +
                colors[index - 1].split(" ")[1] +
                '"></span>'
              : ""
          }</p>
                        </div>`;
        }
      })
      .join("");

    catDetailsElement.innerHTML = detailsHTML;

    // Insert new details after the headers
    if (catDetailsContainer.children.length === 0) {
      catDetailsContainer.appendChild(headers);
    }
    catDetailsContainer.insertBefore(
      catDetailsElement,
      catDetailsContainer.children[1]
    );
  }

  document.getElementById("headers").style.display = "none";

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
