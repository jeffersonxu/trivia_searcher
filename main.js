const url = "http://jservice.io/api/";
window['moment-range'].extendMoment(moment);

//initialize Materialize components
$(document).ready(function(){
    $('select').formSelect();
    $('.datepicker').datepicker({
        yearRange: [1964, 2019]
    });
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

//main runner
$('.submit').click(function(){
    $('.list').empty();
    let category = $('#category').val();
    let difficultyValue = $('#difficulty').val();
    let startDate = moment('3/30/1964').format('YYYY-MM-DD');
    let endDate = moment().format('YYYY-MM-DD');

    if($('#startDate').val() !== '' && $('#endDate').val() !== ''){
        startDate = moment($('#startDate').val()).format('YYYY-MM-DD');
        endDate = moment($('#endDate').val()).format('YYYY-MM-DD');
    }

    search(category, difficultyValue, startDate, endDate);
});

function search(category, difficultyValue, startDate, endDate){
    let bounds = getBounds(difficultyValue);
    let lower = bounds[0], upper = bounds[1];

    $.get(url + 'clues', function(data, status){
        data.forEach(function(element){
            let correctCategory = element.category.title.toLowerCase().includes(category.toLowerCase());
            let correctBounds = element.value >= lower && element.value <= upper;
            let correctDate = moment(element.airdate).isBetween(startDate, endDate);

            if(element.question !== "" && correctCategory && correctBounds && correctDate){
                let card = $('<div>', { class: 'card blue-grey darken-1'});
                card.append(
                    $('<div>', {class: 'card-content white-text'}).append(
                        $('<span>', {
                            class: 'card-title activator',
                            text: element.question
                        }).append(
                            $('<i>', {
                                class: 'material-icons right',
                                text: 'more_vert'
                            }))).append(
                    $('<p>', {
                        text: 'Aired: ' + moment(element.airdate).format('MMMM Do, YYYY')
                    })));

                card.append(
                    $('<div>', { class: 'card-reveal'}).append(
                        $('<span>', {
                            class: 'card-title',
                            text: 'Answer: ' + element.answer.replace('<i>', '').replace('</i>', '').capitalize()
                        }).append(
                            $('<i>', {
                                class: 'material-icons right',
                                text: 'close'
                            }))
                        ).append(
                            $('<p>', {text: 'Difficulty: ' + difficulty(element.value)})).append(
                            $('<p>', {text: 'Category: ' + element.category.title.capitalize()})));

                $('.list').append(
                    $('<div>', {
                        class: 'row'
                    }).append(card)

                )
            }
        });
    });
}