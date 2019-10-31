$(document).ready(function(){
    generateBoard();
});

$('.generateBoard').on('click', function(e){
    generateBoard();
});

//Generates the Jeopardy Board (6 random categories with 5 clues associated)
function generateBoard() {
    $('.categoryTitle, .q').empty();
    for (var i = 0; i < 6; i++) {
        getRandomClues(i);
    }
}

//finds a random category and then the clues within that category
//displays unique category titles and clues to DOM
let offsets = [];
function getRandomClues(rowNum){
    //max offset of categories is 18400
    let offset = Math.floor(Math.random() * 18400) + 1;
    if(offsets.indexOf(offset) === -1){
        $.ajax({
            url: url + 'categories',
            data: { offset: offset },
            beforeSend: function (xhr) {
                xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            },
            type: 'GET',
            dataType: 'JSON',
            success: function(data){
                if(data && data[0].clues_count >= 5){
                    offsets.push(data[0].id);
                    $.ajax({
                        url: url +  'clues',
                        data: {category: data[0].id},
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                        },
                        type: 'GET',
                        dataType: 'JSON',
                        success: function(clues){
                            //clean clues by removing duplicates and empty questions
                            clues = removeDuplicates(clues.filter(function(val){
                                return val.question !== '' }), 'question');

                            //if there are not 6 questions after cleaning, find new category
                            if(clues.length < 5){
                                getRandomClues(rowNum);
                            } else {
                                //Add category title to DOM
                                $('.categoryTitle').append($('<div>', {class: 'col s2'})
                                    .append($('<h6>').text(data[0].title)));

                                //shuffle array
                                let shuffled = clues.sort(() => 0.5 - Math.random());

                                //choose first 5 elements and sort by difficulty
                                clues = shuffled.slice(0, 5).sort(function(a, b){
                                    return a.value - b.value;
                                });

                                //Add clues to DOM going down each column
                                for(var j = 0; j < 5; j++){
                                    $('.questions' + j).append($('<div>', {class: 'col s2'})
                                        .append($('<p>', {class: 'questionText'}).text(clues[j].question))
                                        .append($('<p>', {class : 'ans hide'}).text(clues[j].answer.replace('<i>', '').replace('</i>', '').capitalize() + ' (' + difficulty(clues[j].value) + ')')));
                                }
                            }

                        }
                    })
                }
            }
        });
    }
}

$(document).on('click', 'p.questionText',function(e){
    let ans = $(this).parent().find('p.hide').removeClass('hide');
});

function removeDuplicates(myArr, prop) {
    return myArr.filter((obj, pos, arr) => {
        return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
    });
}