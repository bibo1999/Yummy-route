//  GLOBAL VARIABLES 
let mealsByNameList = [];                   // Stores meal results when searching by name
let dataRow = document.getElementById('dataRow');   // Main container for dynamic content
let searchContainer = document.getElementById('searchContainer'); // Search inputs container

//  INITIAL PAGE LOAD 
$(document).ready(() => {
    // Load default search results and hide loading screen once ready
    getSearchByName("").then(() => {
        $(".loading-screen").fadeOut(500);
        $("body").css("overflow", "auto");
    });
});

//  SIDE MENU TOGGLE 
let navContentWidth = $('.nav-content').innerWidth();

// Hide menu on load
$('.nav-content').animate({ left: -navContentWidth }, 0);
$('.side-menu').animate({ left: -navContentWidth }, 0);

// Menu open/close animation
$('.menu-controller-icon span').click(function () {
    $(this).toggleClass('fa-close');

    // If menu is open → close it
    if ($('.nav-content').css('left') == '0px') {
        $('.nav-content').animate({ left: -navContentWidth }, 500);
        $('.side-menu').animate({ left: -navContentWidth }, 500);
        $('nav li').animate({ top: 300 }, 500);
    }
    // If menu is closed → open it
    else {
        $('.nav-content').animate({ left: 0 }, 500);
        $('.side-menu').animate({ left: 0 }, 500);
        // Staggered animation for nav links
        for (let i = 0; i < 5; i++)
            $('nav li').eq(i).animate({ top: 0 }, (i + 9) * 100);
    }
});

// Close side menu when clicking any nav link
$('nav li a').click(function () {
    $('.nav-content').animate({ left: -navContentWidth }, 500);
    $('.side-menu').animate({ left: -navContentWidth }, 500);
    $('.menu-controller-icon span').toggleClass('fa-close');
});

//  DEFAULT PAGE CONTENT 
getMealsByName();

//  FETCH MEALS BY NAME 
async function getMealsByName() {
    let mealsByNameAPI = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=`);
    let mealsByNameList = await mealsByNameAPI.json();
    displayMealsByName(mealsByNameList.meals);
}

// Render meal cards by name
function displayMealsByName(mealsByNameList) {
    let result = ``;

    for (let i = 0; i < mealsByNameList.length; i++) {
        result += `
        <div class="col-md-3">
            <div class="img-card position-relative" onclick="getMealsById(${mealsByNameList[i].idMeal})">
                <img src="${mealsByNameList[i].strMealThumb}" alt="${mealsByNameList[i].strMeal}" class="border border-0 rounded-2">
                <div class="img-overlay position-absolute bg-white bg-opacity-75 border border-0 rounded-2 overflow-hidden">
                    <h2 class="meal-name justify-content-center d-flex align-items-center h-100">${mealsByNameList[i].strMeal}</h2>
                </div>
            </div>
        </div>`;
    }

    dataRow.innerHTML = result;
}

//  FETCH MEAL BY ID 
async function getMealsById(idMeal) {
    $(".inner-loading-screen").fadeIn(300);

    let mealsByIdAPI = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${idMeal}`);
    let mealsByIdList = await mealsByIdAPI.json();

    displayMealsById(mealsByIdList);
    $(".inner-loading-screen").fadeOut(300);
}

// Render single meal details page
function displayMealsById(mealsByIdList) {
    searchContainer.innerHTML = ``; // Hide search section when viewing details

    // --- Tags Array ---
    let tags = mealsByIdList.meals[0].strTags;
    let resultTags = ``;
    if (tags != null) {
        tags.split(',').forEach(tag => {
            resultTags += `<li class="border border-0 rounded-2 bg-danger-subtle text-danger-emphasis p-2">${tag}</li>`;
        });
    }

    // --- Ingredients & Measures ---
    let ingredientsArr = [];
    let measuresArr = [];
    let recipesArr = [];
    let resultRecipes = ``;

    // Collect ingredient + measure pairs
    for (let i = 1; i <= 20; i++) {
        let ingredient = mealsByIdList.meals[0][`strIngredient${i}`];
        let measure = mealsByIdList.meals[0][`strMeasure${i}`];

        if (ingredient && ingredient.trim() !== "") {
            ingredientsArr.push(ingredient);
            measuresArr.push(measure);
        }
    }

    // Build recipe list items
    for (let i = 0; i < measuresArr.length; i++) {
        let recipeItem = `${measuresArr[i]} ${ingredientsArr[i]}`;
        resultRecipes += `<li class="border border-0 rounded-2 bg-info-subtle text-info-emphasis p-2">${recipeItem}</li>`;
    }

    // --- Render meal details ---
    let result = `
    <div class="col-md-3">
        <div class="meal-caption">
            <img src="${mealsByIdList.meals[0].strMealThumb}" class="border border-0 rounded-2">
            <h1 class="text-white">${mealsByIdList.meals[0].strMeal}</h1>
        </div>
    </div>

    <div class="col-md-9">
    <div class="meal-info text-white p-4 background-custom rounded-lg shadow-sm">
        <h2 class="h4 mb-3">Instructions</h2>
        <p>${mealsByIdList.meals[0].strInstructions}</p><br>

        <h2 class="h5 mb-3">Area: ${mealsByIdList.meals[0].strArea}</h2>
        <h2 class="h5 mb-3">Category: ${mealsByIdList.meals[0].strCategory}</h2><br>

        <div class="recipes">
            <h2 class="h5 mb-2">Recipes:</h2>
            <ul class="d-flex flex-wrap gap-2">${resultRecipes}</ul>
        </div><br>

        <div class="tags">
            <h2 class="h5 mb-2">Tags:</h2>
            <ul class="d-flex flex-wrap gap-2">${resultTags}</ul>
        </div>

        <ul class="d-flex flex-wrap gap-3">
            <li class="btn btn-success p-2 rounded">
                <a href="${mealsByIdList.meals[0].strSource}" target="_blank" class="text-white text-decoration-none">Source</a>
            </li>
            <li class="btn btn-danger p-2 rounded">
                <a href="${mealsByIdList.meals[0].strYoutube}" target="_blank" class="text-white text-decoration-none">Youtube</a>
            </li>
        </ul>
    </div>
</div>`;

    dataRow.innerHTML = result;
}

//  SEARCH 
// Display search inputs
function displaySearchInputs() {
    searchContainer.innerHTML = `
    <div class="row py-4 px-3">
        <div class="col-md-6 py-2">
            <input type="text" onkeyup="getSearchByName(this.value)" class="form-control text-white bg-transparent" placeholder="Search By Name">
        </div>
        <div class="col-md-6 py-2">
            <input type="text" onkeyup="getSearchByFirstLetter(this.value)" class="form-control text-white bg-transparent" placeholder="Search By First Letter" maxlength="1">
        </div>
    </div>`;
    dataRow.innerHTML = ``;
}

// Fetch results by name
async function getSearchByName(searchQuery) {
    $(".inner-loading-screen").fadeIn(300);
    let searchByNameAPI = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${searchQuery}`);
    let searchByNameList = await searchByNameAPI.json();
    displaySearchByName_FirstLetter(searchByNameList);
}

// Fetch results by first letter
async function getSearchByFirstLetter(searchQuery) {
    $(".inner-loading-screen").fadeIn(300);
    let searchByFirstLetterAPI = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${searchQuery}`);
    let searchByFirstLetterList = await searchByFirstLetterAPI.json();
    displaySearchByName_FirstLetter(searchByFirstLetterList);
}

// Render unified search results
function displaySearchByName_FirstLetter(searchQuery) {
    if (searchQuery.meals != null)
        displayMealsByName(searchQuery.meals);
    $(".inner-loading-screen").fadeOut(300);
}

//  CATEGORIES 
async function getMealsByCategories() {
    $(".inner-loading-screen").fadeIn(300);
    let mealsByCategoryAPI = await fetch(`https://www.themealdb.com/api/json/v1/1/categories.php`);
    let mealsByCategoryList = await mealsByCategoryAPI.json();
    displayMealsByCategory(mealsByCategoryList.categories);
    $(".inner-loading-screen").fadeOut(300);
}

// Render all categories
function displayMealsByCategory(mealsByCategoryList) {
    searchContainer.innerHTML = ``;

    let result = ``;
    mealsByCategoryList.forEach(category => {
        result += `
        <div class="col-md-3">
            <div class="img-card position-relative" onclick="filterMealsByCategory('${category.strCategory}')">
                <img src="${category.strCategoryThumb}" class="border border-0 rounded-2">
                <div class="img-overlay position-absolute text-center bg-white bg-opacity-75 rounded-2 overflow-hidden">
                    <h2>${category.strCategory}</h2>
                    <p>${category.strCategoryDescription}</p>
                </div>
            </div>
        </div>`;
    });

    dataRow.innerHTML = result;
}

// Filter meals by selected category
async function filterMealsByCategory(categoryName) {
    $(".inner-loading-screen").fadeIn(300);
    let filterByCategoryAPI = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoryName.trim()}`);
    let filterByCategoryList = (await filterByCategoryAPI.json()).meals.slice(0, 20);
    displayMealsByName(filterByCategoryList);
    $(".inner-loading-screen").fadeOut(300);
}

//  AREA 
// Fetch available areas
async function getMealsByArea() {
    $(".inner-loading-screen").fadeIn(300);
    let mealsByAreaAPI = await fetch(`https://www.themealdb.com/api/json/v1/1/list.php?a=list`);
    let mealsByAreaList = await mealsByAreaAPI.json();
    displayMealsByArea(mealsByAreaList.meals);
    $(".inner-loading-screen").fadeOut(300);
}

// Render areas
function displayMealsByArea(mealsByAreaList) {
    searchContainer.innerHTML = ``;

    let result = ``;
    mealsByAreaList.forEach(area => {
        result += `
        <div class="col-md-3">
            <div class="text-white text-center cursor-pointer" onclick="filterMealsByArea('${area.strArea}')">
                <i class="fa-solid fa-house-laptop fa-4x"></i>
                <h2>${area.strArea}</h2>
            </div>
        </div>`;
    });

    dataRow.innerHTML = result;
}

// Filter by selected area
async function filterMealsByArea(areaName) {
    $(".inner-loading-screen").fadeIn(300);
    let filterByAreaAPI = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?a=${areaName}`);
    let filterByAreaList = (await filterByAreaAPI.json()).meals.slice(0, 20);
    displayMealsByName(filterByAreaList);
    $(".inner-loading-screen").fadeOut(300);
}

//  INGREDIENTS 
async function getMealsByIngredients() {
    $(".inner-loading-screen").fadeIn(300);
    let mealsByIngredientsAPI = await fetch(`https://www.themealdb.com/api/json/v1/1/list.php?i=list`);
    let mealsByIngredientsList = (await mealsByIngredientsAPI.json()).meals.slice(0, 20);
    displayMealsByIngredients(mealsByIngredientsList);
    $(".inner-loading-screen").fadeOut(300);
}

// Render ingredients list
function displayMealsByIngredients(mealsByIngredientsList) {
    searchContainer.innerHTML = ``;

    let result = ``;
    mealsByIngredientsList.forEach(ingredient => {
        result += `
        <div class="col-md-3">
            <div class="text-white text-center cursor-pointer"
                 onclick="filterMealsByIngredients('${ingredient.strIngredient}')">
                <i class="fa-solid fa-drumstick-bite fa-4x"></i>
                <h2>${ingredient.strIngredient}</h2>
                <p>${ingredient.strDescription.slice(0, 100)}</p>
            </div>
        </div>`;
    });

    dataRow.innerHTML = result;
}

// Filter meals by selected ingredient
async function filterMealsByIngredients(ingredientName) {
    $(".inner-loading-screen").fadeIn(300);
    let filterByIngredientsAPI = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredientName}`);
    let filterByIngredientsList = (await filterByIngredientsAPI.json()).meals.slice(0, 20);
    displayMealsByName(filterByIngredientsList);
    $(".inner-loading-screen").fadeOut(300);
}

//  CONTACT FORM 
// Render contact form & attach validation handlers
// Contact
function contactForm() {
    searchContainer.innerHTML = ``;//to hide the search when we display the meal.
    let result = `
    <div class="min-vh-100 w-75 mx-auto d-flex align-items-center justify-content-center">

                    <form action="#">
                        <div class="row g-4" id="">
                            <div class="col-md-6">
                                <input type="text" id="nameInput"  class="form-control "
                                    placeholder="Enter Your Name">
                                <p id="nameAlert" class="alert alert-danger w-100 mt-2 d-none text-center">
                                    Special characters and numbers not allowed
                                </p>
                            </div>
                            <div class="col-md-6">
                                <input type="email" id="emailInput" class="form-control "
                                    placeholder="Enter Your Email">
                                <p id="emailAlert" class="alert alert-danger w-100 mt-2 d-none text-center">
                                    Email not valid *exemple@yyy.zzz
                                </p>
                            </div>
                            <div class="col-md-6">
                                <input type="tel" id="phoneInput"  class="form-control "
                                    placeholder="Enter Your Phone">
                                <p id="phoneAlert" class="alert alert-danger w-100 mt-2 d-none text-center">
                                    Enter valid Phone Number
                                </p>
                            </div>
                            <div class="col-md-6">
                                <input type="number" id="ageInput"  class="form-control "
                                    placeholder="Enter Your Age" min="18" max="60">
                                <p id="ageAlert" class="alert alert-danger w-100 mt-2 d-none text-center">
                                    Enter valid age
                                </p>
    
                            </div>
                            <div class="col-md-6">
                                <input type="password" id="passInput"  class="form-control "
                                    placeholder="Enter Your Password">
                                <p id="passAlert" class="alert alert-danger w-100 mt-2 d-none text-center">
                                    Enter valid password *Minimum eight characters, at least one letter and one number:*
                                </p>
                            </div>
                            <div class="col-md-6">
                                <input type="password" id="repassInput"  class="form-control "
                                    placeholder="RePassword">
                                <p id="repassAlert" class="alert alert-danger w-100 mt-2 d-none text-center">
                                    Enter valid repassword
                                </p>
                            </div>
                            <div class="col text-center">
                                <button id="submitBtn" class="btn btn-submit cursor-pointer" disabled>Submit</button>
                            </div>
                        </div>
                    </form>
                </div>   
    `
    dataRow.innerHTML = result;
    
    //Validation handlers
    const nameInput = document.getElementById('nameInput');
    const emailInput = document.getElementById('emailInput');
    const phoneInput = document.getElementById('phoneInput');
    const ageInput = document.getElementById('ageInput');
    const passInput = document.getElementById('passInput');
    const repassInput = document.getElementById('repassInput');
    const nameAlert = document.getElementById('nameAlert');
    const emailAlert = document.getElementById('emailAlert');
    const phoneAlert = document.getElementById('phoneAlert');
    const ageAlert = document.getElementById('ageAlert');
    const passAlert = document.getElementById('passAlert');
    const repassAlert = document.getElementById('repassAlert');

    nameInput.addEventListener('blur', () => {
        if (nameInput.value !== '' && nameRegexFunc(nameInput.value))
            nameAlert.classList.replace('d-block', 'd-none');
        else
            nameAlert.classList.replace('d-none', 'd-block');
        checkAllValidation();
    });
    nameInput.addEventListener('input', () => {
        if (nameInput.value !== '' && nameRegexFunc(nameInput.value))
            nameAlert.classList.replace('d-block', 'd-none');
        else
            nameAlert.classList.replace('d-none', 'd-block');
        checkAllValidation();
    });
    emailInput.addEventListener('blur', () => {
        if (emailInput.value.trim() !== '' && emailRegexFunc(emailInput.value))
            emailAlert.classList.replace('d-block', 'd-none');
        else
            emailAlert.classList.replace('d-none', 'd-block');
        checkAllValidation();
    });
    emailInput.addEventListener('input', () => {
        if (emailInput.value !== '' && emailRegexFunc(emailInput.value))
            emailAlert.classList.replace('d-block', 'd-none');
        else
            emailAlert.classList.replace('d-none', 'd-block');
        checkAllValidation();
    });
    phoneInput.addEventListener('blur', () => {
        if (phoneInput.value.trim() !== '' && phoneRegexFunc(phoneInput.value))
            phoneAlert.classList.replace('d-block', 'd-none');
        else
            phoneAlert.classList.replace('d-none', 'd-block');
        checkAllValidation();
    });
    phoneInput.addEventListener('input', () => {
        if (phoneInput.value !== '' && phoneRegexFunc(phoneInput.value))
            phoneAlert.classList.replace('d-block', 'd-none');
        else
            phoneAlert.classList.replace('d-none', 'd-block');
        checkAllValidation();
    });
    ageInput.addEventListener('blur', () => {
        if (ageInput.value !== '' && ageRegexFunc(ageInput.value))
            ageAlert.classList.replace('d-block', 'd-none');
        else
            ageAlert.classList.replace('d-none', 'd-block');
        checkAllValidation();
    });
    ageInput.addEventListener('input', () => {
        if (ageInput.value !== '' && ageRegexFunc(ageInput.value))
            ageAlert.classList.replace('d-block', 'd-none');
        else
            ageAlert.classList.replace('d-none', 'd-block');
        checkAllValidation();
    });
    passInput.addEventListener('blur', () => {
        if (passInput.value !== '' && passRegexFunc(passInput.value))
            passAlert.classList.replace('d-block', 'd-none');
        else
            passAlert.classList.replace('d-none', 'd-block');
        checkAllValidation();
    });
    passInput.addEventListener('input', () => {
        if (passInput.value !== '' && passRegexFunc(passInput.value))
            passAlert.classList.replace('d-block', 'd-none');
        else
            passAlert.classList.replace('d-none', 'd-block');
        checkAllValidation();
    });
    repassInput.addEventListener('blur', () => {
        if (repassInput.value !== '' && passRegexFunc(repassInput.value) && repassInput.value === passInput.value)
            repassAlert.classList.replace('d-block', 'd-none');
        else
            repassAlert.classList.replace('d-none', 'd-block');
        checkAllValidation();
    });
    repassInput.addEventListener('input', () => {
        if (repassInput.value !== '' && passRegexFunc(repassInput.value) && repassInput.value === passInput.value)
            repassAlert.classList.replace('d-block', 'd-none');
        else
            repassAlert.classList.replace('d-none', 'd-block');
        checkAllValidation();
    });
}
// REGEX
function emailRegexFunc(value) {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailRegex.test(value);
}

function nameRegexFunc(value) {
    const nameRegex = /^[A-Za-z]+$/;
    return nameRegex.test(value);
}

function phoneRegexFunc(value) {
    const phoneRegex = /^(\d{10}|\d{11})$/;
    return phoneRegex.test(value);
}

function ageRegexFunc(value) {
    const ageRegex = /^(1[8-9]|[2-5][0-9]|60)$/;
    return ageRegex.test(value);
}
function passRegexFunc(value) {
    const passRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return passRegex.test(value);
}
// CHECK Validation
function checkAllValidation() {
    const submitBtn = document.getElementById('submitBtn');
    if (nameRegexFunc(nameInput.value) && emailRegexFunc(emailInput.value) && phoneRegexFunc(phoneInput.value) && ageRegexFunc(ageInput.value) && passRegexFunc(passInput.value) && passRegexFunc(repassInput.value) && repassInput.value === passInput.value) {
        // Remove the disabled attribute
        submitBtn.removeAttribute('disabled');
    }
    else {
        // Set the disabled attribute
        submitBtn.setAttribute('disabled', '');
    }
}