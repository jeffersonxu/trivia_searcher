//Favorited
let numFavorited = 0;
$('.list').on('click', '.favorite', function(event){
    //Update icon
    $(this).text('favorite');
    $(this).removeClass('favorite');
    $(this).addClass('favorite_selected');

    //Add to favorites tab
    let id = '#' + $(this).attr('id').replace('fav-', '');
    $('#favorite').append($(id).clone());

    updateCount('add');
});

//Unfavorited
//Case 1: Unfavoriting via Entires tab
$('.list').on('click', '.favorite_selected', function(event){
    //Update icon
    $(this).text('favorite_border');
    $(this).removeClass('favorite_selected');
    $(this).addClass('favorite');

    //delete card in Favorite tab
    let id = $(this).attr('id').replace('fav-', '');
    $('#favorite #' + id).remove();

    updateCount('remove');
});

//Case 2: Unfavoriting via Favorites tab
$('#favorite').on('click', '.favorite_selected', function(event){
    //Update icon
    $(this).text('favorite_border');
    $(this).removeClass('favorite_selected');
    $(this).addClass('favorite');

    //delete card in Favorite tab
    let id = $(this).attr('id').replace('fav-', '');
    $('#favorite #' + id).remove();

    //Toggle favorite icon in Entries tab
    $('#listWrapper ' + '#fav-' + id).text('favorite_border');
    $('#listWrapper ' + '#fav-' + id).removeClass('favorite_selected');
    $('#listWrapper ' + '#fav-' + id).addClass('favorite');

    updateCount('remove');
});

function updateCount(action){
    if(action === 'remove'){
        numFavorited--;
        if(numFavorited == 0){
            $('.numFavorited').empty();
            $('.no-fav').show();
        }
        else
            $('.numFavorited').text(numFavorited + (numFavorited == 1 ? ' Entry' : ' Entries'));
    } else {
        numFavorited++;
        $('.numFavorited').text(numFavorited + (numFavorited == 1 ? ' Entry' : ' Entries'));
        $('.no-fav').hide();
    }
}