const url = "http://jservice.io/api/";

//initialize Materialize components
$(document).ready(function(){
    $('select').formSelect();
    $('.datepicker').datepicker({
        yearRange: [1964, 2019]
    });
    $('.tabs').tabs();
});

//main runner
$('.submit').click(function(){
    $('.list').empty();
    $('numList').empty();
    let settings = {};
    let category = $('#category').val();
    settings.difficultyValue = $('#difficulty').val();
    settings.startDate = moment('3/30/1964').format('YYYY-MM-DD');
    settings.endDate = moment().format('YYYY-MM-DD');

    if($('#startDate').val() !== '' && $('#endDate').val() !== ''){
        settings.startDate = moment($('#startDate').val()).format('YYYY-MM-DD');
        settings.endDate = moment($('#endDate').val()).format('YYYY-MM-DD');
    }

    search(category, 0, settings);
});

//helper functions
function difficulty(num){
    if(num <= 333)
        return "Easy";
    else if(num <= 667)
        return "Medium";
    else
        return "Hard";
}

function getBounds(difficulty){
    let lower = 0, upper = 1000;
    if(difficulty === 'easy')
        upper = 333;
    else if(difficulty === 'medium'){
        lower = 333;
        upper = 667;
    } else if(difficulty === 'hard')
        lower = 667;

    return [lower, upper];
}

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

//recursive function that searches 100 entries (max capacity) at a time
function search(category, offset, settings, notFound=true){
    $.ajax({
        url: url + 'categories',
        data: {
            "count" : 100,
            "offset" : offset,
        },
        type: 'GET',
        dataType: 'JSON',
        success: function(categories){
            //display error msg since no data found
            if(categories == undefined || categories.length == 0){
                $('.list').append(
                    $('<div>', {class: 'row error red darken-4 white-text'}).append(
                        $('<p>', {
                            class: 'col s12',
                            text: "Sorry we couldn't find any trivia questions that matched your search criteria. Try again?"
                        }
                    )).append(
                        $('<i>', {
                            class: 'medium material-icons',
                            text: 'sentiment_very_dissatisfied'
                })));
            }
            else {
                //parse the 100 entries for category
                categories.forEach(function(c){
                    if(c.title !== null && (c.title.toLowerCase().includes(category.toLowerCase()))){
                        notFound = false;
                        $.ajax({
                            url: url + 'clues',
                            data: { "category" : c.id },
                            type: 'GET',
                            dataType: 'JSON',
                            success: function(clues){
                                //generate DOM elements for the clues found
                                createList(clues, settings);
                            }
                        });
                    }
                });
                //search another 100 entries
                if(notFound)
                    search(category, offset + 100, settings);
            }
        }
    });
}

//Creates DOM elements using Materialize components of the clues
function createList(clues, settings){
    let bounds = getBounds(settings.difficultyValue);
    let lower = bounds[0], upper = bounds[1];

    $('.numList').text(clues.length + (clues.length == 1 ? ' Entry' : ' Entries'));
    clues.forEach(function(clue){
        let correctDifficulty = clue.value >= lower && clue.value <= upper;
        let correctDate = moment(clue.airdate).isBetween(settings.startDate, settings.endDate);

        if(clue.question !== "" && correctDifficulty && correctDate){
            let card = $('<div>', { class: 'card blue-grey darken-1'});
            let favorite = $('<a>').append()
            card.append(
                $('<div>', {class: 'card-content white-text'}).append(
                    $('<span>', {
                        class: 'card-title row',
                        text: clue.question
                    }).append(
                        $('<i>', {
                            class: 'activator material-icons right white-text',
                            text: 'more_vert'
                            })).append(
                            $('<a>').append(
                                $('<i>', {
                                    id: 'fav-' + clue.id,
                                    class: 'right material-icons favorite',
                                    text: 'favorite_border'
                                })))).append(
                            $('<p>', {
                                text: 'Aired: ' + moment(clue.airdate).format('MMMM Do, YYYY')
            })));

            card.append(
                $('<div>', { class: 'card-reveal'}).append(
                    $('<span>', {
                        class: 'card-title',
                        text: 'Answer: ' + clue.answer.replace('<i>', '').replace('</i>', '').capitalize()
                    }).append(
                        $('<i>', {
                            class: 'material-icons right',
                            text: 'close'
                        }))
                    ).append(
                        $('<p>', {text: 'Difficulty: ' + difficulty(clue.value)} ).append(
                            $('<span>', {class: 'category', text: 'Category: ' + clue.category.title.capitalize()}).append(
                                ))));

            $('.list').append($('<div>', { id: clue.id, class: 'row' }).append(card));
        }
    });
}