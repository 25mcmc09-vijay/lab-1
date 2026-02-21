$(document).ready(function () {

    let pokemonArray = [];
    $.ajax({
        type: "GET",
        url: "pokemon.xml",
        dataType: "xml",
        success: function (xml) {

          
            $(xml).find("pokemon").each(function () {

                let pokemon = {
                    name: $(this).find("name").text(),
                    trainer: $(this).find("trainer").text(),
                    type: $(this).find("type").text(),
                    power: parseInt($(this).find("power").text()),
                    region: $(this).find("region").text()
                };

                pokemonArray.push(pokemon);
            });

            populateFilters(pokemonArray);
            displayPokemon(pokemonArray);
        }
    });

    function displayPokemon(data) {

        let tbody = $("#pokemonTable tbody");
        tbody.empty();

        $.each(data, function (index, pokemon) {

            let row = `<tr>
                <td>${pokemon.name}</td>
                <td>${pokemon.trainer}</td>
                <td>${pokemon.type}</td>
                <td>${pokemon.power}</td>
                <td>${pokemon.region}</td>
            </tr>`;

            tbody.append(row);
        });
    }

 
    function populateFilters(data) {

        let types = new Set();
        let trainers = new Set();

        $.each(data, function (i, pokemon) {
            types.add(pokemon.type);
            trainers.add(pokemon.trainer);
        });

        $.each(types, function (i, type) {
            $("#typeFilter").append(`<option value="${type}">${type}</option>`);
        });

        $.each(trainers, function (i, trainer) {
            $("#trainerFilter").append(`<option value="${trainer}">${trainer}</option>`);
        });
    }

 
    $("#applyFilter").click(function () {

        let selectedType = $("#typeFilter").val();
        let selectedTrainer = $("#trainerFilter").val();
        let minPower = parseInt($("#minPower").val()) || 0;
        let maxPower = parseInt($("#maxPower").val()) || Infinity;

        let filtered = pokemonArray.filter(function (pokemon) {

            return (selectedType === "" || pokemon.type === selectedType) &&
                   (selectedTrainer === "" || pokemon.trainer === selectedTrainer) &&
                   (pokemon.power >= minPower && pokemon.power <= maxPower);
        });

        displayPokemon(filtered);
    });

});