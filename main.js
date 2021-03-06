const url = "https://cors-anywhere.herokuapp.com/http://jservice.io/api/";

//initialize Materialize components
$(document).ready(function(){
    $('select').formSelect();
    $('.datepicker').datepicker({
        yearRange: [1964, 2019]
    });
    $('.tabs').tabs();
    $('.currentDate').text(moment().format('MMMM Do, YYYY'));
});

//main runner
$('form').submit(function(e){
    e.preventDefault();
    $('.list').empty();
    $('.numList').empty();

    let settings = {};
    let category = $('#category').val();
    settings.difficultyValue = $('#difficulty').val();
    settings.startDate = ($('#startDate').val() === '') ? moment('3/30/1964').format('YYYY-MM-DD') : moment($('#startDate').val()).format('YYYY-MM-DD');
    settings.endDate = ($('#endDate').val() === '') ? moment().format('YYYY-MM-DD') : moment($('#endDate').val()).format('YYYY-MM-DD');

    //Display Materialize progress bar while searching
    $('.progress').show();
    search(category, 0, settings);
});

//Helper Functions

//given a clue value, returns difficulty
function difficulty(num){
    if(num <= 333)
        return "Easy";
    else if(num <= 667)
        return "Medium";
    else
        return "Hard";
}

//returns value range for each difficulty
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

//capitalizes strings
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

//recursive function that searches 100 entries (max capacity) at a time
//stops once category is found
function search(category, offset, settings, notFound=true){
    $.ajax({
        url: url + 'categories',
        data: {
            "count" : 100,
            "offset" : offset,
        },
        beforeSend: function (xhr) {
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        },
        type: 'GET',
        dataType: 'JSON',
        success: function(categories){
            //display error msg since no data found
            if(categories == undefined || categories.length == 0){
                $('.progress').hide();
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
            } else {
                //parse the 100 entries for category
                categories.forEach(function(c){
                    if(c.title !== null && (c.title.toLowerCase().includes(category.toLowerCase()))){
                        notFound = false;
                        $.ajax({
                            url: url + 'clues',
                            data: { "category" : c.id },
                            beforeSend: function (xhr) {
                                xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                            },
                            type: 'GET',
                            dataType: 'JSON',
                            success: function(clues){
                                //generate DOM elements for the clues found
                                $('.progress').hide();
                                createList(clues, settings);
                            }
                        });
                    }
                });
                //search another 100 entries if not found
                if(notFound)
                    search(category, offset + 100, settings);
            }
        }
    });
}

//Creates DOM elements using Materialize components of the clues
//Filters out clues based off settings (dates & difficulty)
function createList(clues, settings){
    let bounds = getBounds(settings.difficultyValue);
    let lower = bounds[0], upper = bounds[1];
    let count = 0;

    clues.forEach(function(clue){
        let correctDifficulty = clue.value >= lower && clue.value <= upper;
        let correctDate = moment(clue.airdate).isBetween(settings.startDate, settings.endDate);

        if(clue.question !== "" && correctDifficulty && correctDate){
            count++;
            let card = $('<div>', { class: 'card blue-grey darken-1'});

            //front card (question)
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

            //back card (answer)
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

    $('.numList').text(count + (count == 1 ? ' Entry' : ' Entries'));
}