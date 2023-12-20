


document.addEventListener("DOMContentLoaded", function () {

    const bodyElements = document.getElementById("webbody");
    bodyElements.style.backgroundImage = `url(${webconfig.body_BG})`;

    const tags = ["nav", "footer"];
    const _elements = {}; // 定义一个空对象
    tags.forEach(tag => {
        const elements = document.getElementsByTagName(tag);
        // for (let element of elements) {
        //     element.style.backgroundColor = `hsla(${Math.random() * 360}, 30%, 80%, 30%)`;
        // }
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


    const sec_intro = this.getElementById("intro")
    const sec_speakers = this.getElementById("speakers")
    const sec_agenda = this.getElementById("agenda")
    const sec_faq = this.getElementById("faq")
    const sec_organizer = this.getElementById("organizer")
    //#intro
    for (let i = 0; i < introEN.length; i++) {
        const content = introEN[i];
        const h4 = document.createElement("h4");
        h4.textContent = content.txt;
        sec_intro.appendChild(h4)
    }
    //#intro#

    //#speakers
    const agenda_main = document.createElement("main");
    for (let i = 0; i < speakersEN.length; i++) {
        const content = speakersEN[i];
        const h3 = document.createElement("h3");
        h3.textContent = content.sp_name;
        const h5 = document.createElement("h5");
        h5.textContent = content.sp_title;
        const p = document.createElement("p");
        p.textContent = content.sp_discript;

        const sptxt_div = document.createElement("div");
        sptxt_div.classList.add("sb_txt");
        sptxt_div.appendChild(h3);
        sptxt_div.appendChild(h5);
        sptxt_div.appendChild(p);

        const spimg_div = document.createElement("div");
        spimg_div.classList.add("sb_img");
        spimg_div.style.backgroundImage = `url("${content.sp_image}")`;

        const spbox_div = document.createElement("div");
        spbox_div.classList.add("speaker_box");
        spbox_div.appendChild(spimg_div);
        spbox_div.appendChild(sptxt_div);

        agenda_main.appendChild(spbox_div)
    }
    sec_speakers.appendChild(agenda_main);
    //#speakers#

    //#agenda
    const agenda_img = document.createElement("img");
    agenda_img.classList = 'agenda_img';
    agenda_img.src = agendaEN;
    sec_agenda.appendChild(agenda_img);
    //#agenda#

    //#faq
    const faqRdiv = document.createElement("div");
    for (let i = 0; i < faqREN.length; i++) {
        const content = faqREN[i]
        const summary = document.createElement("summary");
        summary.classList = "faq-question";
        summary.textContent = content.question;
        const p = document.createElement("p");
        p.classList = "faq-answer";
        p.textContent = content.anwer;

        const details = document.createElement("details");
        details.classList = "faq-section"
        details.appendChild(summary);
        details.appendChild(p);

        faqRdiv.appendChild(details)
    }
    const faqLdiv = document.createElement("div");
    for (let i = 0; i < faqLEN.length; i++) {
        const content = faqLEN[i]
        const summary = document.createElement("summary");
        summary.classList = "faq-question";
        summary.textContent = content.question;
        const p = document.createElement("p");
        p.classList = "faq-answer";
        p.textContent = content.anwer;

        const details = document.createElement("details");
        details.classList = "faq-section"
        details.appendChild(summary);
        details.appendChild(p);

        faqLdiv.appendChild(details);
    }

    const faq_main = document.createElement("main");
    faq_main.appendChild(faqLdiv);
    faq_main.appendChild(faqRdiv);
    sec_faq.appendChild(faq_main);
    //#faq#

    //#organizer
    for (let i = 0; i < faqLEN.length; i++) {
        const content = organizerEN[i];
        const organizer_img = document.createElement("img");
        organizer_img.src = content.org_src;
        sec_organizer.appendChild(organizer_img);
    }



    // //randombackground
    // tags.forEach(tag => {
    //     const bgelements = document.getElementsByTagName(tag);
    //     for (let bgelement of bgelements) {
    //         bgelement.style.backgroundColor = `hsl(${Math.random() * 360}, 30 %, 80 %)`;
    //     }
    // });
});