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
        'compile_button': 'button#button-compile'
    },

    controller = {
        compile: function() {
            var json;
            json = $(view.object).val();

            // Set the tempate and set the JSON obj
            model.html_template = $(view.template).val();
            model.JSON_object = $.parseJSON(json);

            // Combover Render
            //$('#result').html(model.html_template(model.JSON_object));

            // Compile
            //$(model.html_template) = Combover.compile('#result');

            /* --------- debigging --------- */
            console.log('--- template ---');
            console.log(model.html_template);

            console.log('--- object ---');
            console.log(model.JSON_object);
        }
    },

    eventBinder = function() {
        $(view.compile_button).on('click' , controller.compile);
    };

    return {
        init: function() {
            eventBinder();

        }
    }

}(jQuery));