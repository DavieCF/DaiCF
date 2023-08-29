import i18next from 'i18next';

var resources = {
    "tw": {
        "translation":{
            "content":{
                "forum": "論壇介紹"
            }
        }
    },
    "en":{
        "translation":{
            "content":{
                "forum": "Introduction"
            }
        }
    }
}

i18n.init({"resStore": resources}, function( t ) {
    $('.i18n').i18n();
});





