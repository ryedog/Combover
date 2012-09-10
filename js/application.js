Combover_playgound = (function ($) {
    'use strict';
    var model = {
       'html_template': null,
       'JSON_object': null,
       'result': null,
       'combover_object': null
    },

    view = {
        'template': 'textarea#textarea-html-template',
        'object': 'textarea#textarea-json-object',
        'compile_button': 'button#button-compile',
        'reset': 'a#try-again',
        'result': 'div#result'
    },

    controller = {
        compile: function() {
            var json, template, reset;
            json = $(view.object).val();

            // Set the tempate and set the JSON obj
            model.html_template = $(view.template).val();
            model.JSON_object = $.parseJSON(json);

            Combover.debug = true;

            template = Combover.compile(model.html_template);

            $(view.result).html(template(model.JSON_object));

            $(view.reset).removeClass('hidden');
            
        }, 

        resetResultUI: function(e) {
            
            e.preventDefault();

            var template, json, code, trigger

            template = '<div><div comb="hairspray"></div></div>';
            json = '{"hairspray": "extra hold"}';

            //1. Reset HTML
            $(view.template).val(template);

            //2. Reset JSON
            $(view.object).val(json);

            //3. Reset Result
            $(view.result).html('');

            //4. Show compile button
            $(view.result).append('<button id="button-compile"class="btn">Compile Result</button>');

            //5. Hide try again
            $(view.reset).addClass('hidden');


        }
    },

    eventBinder = function() {
        $('.code').delegate(view.compile_button,'click' , controller.compile);
        $('.sample-code').delegate('a#try-again', 'click', controller.resetResultUI);
    };

    return {
        init: function() {
            eventBinder();
        }
    }

}(jQuery));