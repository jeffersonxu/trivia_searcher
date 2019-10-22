let offsets = [];

//finds a random category and then the clues within that category
//displays unique category titles and clues to DOM
function randomCategory(rowNum){
    //max offset of categories is 18400
    let num = Math.floor(Math.random() * 18400) + 1;
    if(offsets.indexOf(num) === -1){
        $.ajax({
            url: url + 'categories',
            data: { offset: num },
            type: 'GET',
            dataType: 'JSON',
            success: function(data){
                if(data && data[0].clues_count >= 5){
                    offsets.push(data[0].id);

                    //Add category title to DOM
                    $('.categoryTitle').append($('<div>', {class: 'col s2'})
                        .append($('<h6>').text(data[0].title)));

                    $.ajax({
                        url: url +  'clues',
                        data: {category: data[0].id},
                        type: 'GET',
                        dataType: 'JSON',
                        success: function(clues){
                            //clean clues by removing duplicates and empty questions
                            clues = removeDuplicates(clues.filter(function(val){
                                return val.question !== '' }), 'question');

                            //shuffle array
                            let shuffled = clues.sort(() => 0.5 - Math.random());
                            //choose first 5 elements and sort by difficulty
                            clues = shuffled.slice(0, 5).sort(function(a, b){
                                return a.value - b.value;
                            });

                            //Add clues to DOM going down each column
                            for(var j = 0; j < 5; j++){
                                $('.questions' + j).append($('<div>', {class: 'col s2'})
                                    .append($('<p>').text(clues[j].question)));
                            }
                        }
                    })
                }
            }
        });
    }
}

function removeDuplicates(myArr, prop) {
    return myArr.filter((obj, pos, arr) => {
        return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
    });
}

//Generate 6 random categories
for (var i = 0; i < 6; i++) {
    randomCategory(i);
}