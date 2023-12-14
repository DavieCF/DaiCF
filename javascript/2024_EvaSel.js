const webconfig = {
    body_BG: "./2023_images/n6.png",
}

const navbarEN = [
    {
        txt: "Intro",
        a: "#intro",

    },
    {
        txt: "Agenda",
        a: "#agenda",

    },
    {
        txt: "Honored Guest",
        a: "#honoredhuest",

    },
    {
        txt: "Speakers",
        a: "#speakers",

    },
    {
        txt: "FAQ",
        a: "#faq",

    },
    {
        txt: "Organizer",
        a: "#organizer",

    },
    {
        txt: "Contact",
        a: "#contact",

    },
    {
        txt: "中文",
        a: "index.html",
    },
]






document.addEventListener("DOMContentLoaded", function () {

    const bodyElements = document.getElementById("webbody");
    bodyElements.style.backgroundImage = `url(${webconfig.body_BG})`;

    const tags = ["header", "nav", "aside", "article", "figure", "p", "section", "footer"];
    const _elements = {}; // 定义一个空对象
    tags.forEach(tag => {
        const elements = document.getElementsByTagName(tag);
        for (let element of elements) {
            element.style.backgroundColor = `hsla(${Math.random() * 360}, 30%, 80%, 30%)`;
        }
        _elements[tag] = elements;
    });

    var lang = document.documentElement.lang;
    let navbar;
    if (lang === "en") {
        navbar = navbarEN;
        console.log("The language is English.");
    } else {
        console.log("The language is not English.");
    }

    // #nav
    const navElements = _elements.nav;

    if (navElements.length > 0) { // 確保至少有一個 nav 元素
        navElements[0].innerHTML = "";
        for (let i = 0; i < navbar.length; i++) {
            const content = navbar[i];
            const navdiv = document.createElement("div");
            navdiv.classList.add("navdiv");
            const nava = document.createElement("a");
            nava.href = content.a
            navdiv.textContent = content.txt
            nava.appendChild(navdiv)
            navElements[0].appendChild(nava); // 假設添加到第一個 nav 元素
            //<a><div>txt<div><a>
        }
    }
    // #nav#




    // //randombackground
    // tags.forEach(tag => {
    //     const bgelements = document.getElementsByTagName(tag);
    //     for (let bgelement of bgelements) {
    //         bgelement.style.backgroundColor = `hsl(${Math.random() * 360}, 30 %, 80 %)`;
    //     }
    // });
});