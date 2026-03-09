const fromFields = [
    {
        type: "text",
        label : "Name",
        name : "name",
        required:true,
    },
    {
        type:"email",
        label:"Email",
        name:"email",
        required:true
    },
    {
        type:"password",
        name:"password",
        label:"Password",
        required:true
    },
    {
        type:"select",
        label:"Country",
        name:"country",
        required:true,
        options:["USA","Canada","India"]
    },
    {
        type: "select",
        name: "state",
        label: "State",
        required: true,
        dependsOn: "country",
        showWhen: "USA",
        options: ["California", "Texas", "New York"]
    },
    {
        type : "radio",
        label : "Account Type",
        name : "accountType",
        options : ["Personal","Business"],
        required : true
    },
];

$(function(){

    const form = $("<form id='dynamicForm'></form>");

    // 🔹 Build form dynamically
    fromFields.forEach(field => {

        const group = $("<div class='form-group'></div>");
        group.attr("data-name", field.name);

        const label = $("<label></label>").text(field.label);
        group.append(label);

        let input;

        if(field.type === "select"){
            input = $("<select></select>").attr("name", field.name);
            input.append("<option value=''>Select</option>");

            field.options.forEach(option => {
                input.append(`<option value="${option}">${option}</option>`);
            });
        }

        else if(field.type === "radio"){
            input = $("<div></div>");
            field.options.forEach(option => {
                input.append(`
                    <label>
                        <input type="radio" name="${field.name}" value="${option}">
                        ${option}
                    </label>
                `);
            });
        }

        else{
            input = $("<input>")
                .attr("type", field.type)
                .attr("name", field.name);
        }

        if(field.required){
            input.attr("data-required", "true");
        }

        group.append(input);
        group.append("<div class='error' style='color:red'></div>");

   
        if(field.dependsOn){
            group.hide();
        }

        form.append(group);
    });

    form.append("<button type='submit'>Submit</button>");

    $("#formContainer").append(form);



    $(document).on("change", "select[name='country']", function(){
        const selected = $(this).val();
        const stateField = $("[data-name='state']");

        if(selected === "USA"){
            stateField.show();
        } else {
            stateField.hide();
            stateField.find("select").val("");
        }
    });


    $("#dynamicForm").on("submit", function(e){

        e.preventDefault();
        let isValid = true;

        $(".error").text("");

        $("#dynamicForm .form-group:visible").each(function(){

            const input = $(this).find("input, select");
            const value = input.val();
            const required = input.data("required");

            if(required && (!value || value === "")){
                $(this).find(".error").text("This field is required");
                isValid = false;
            }

  
            if(input.attr("type") === "email"){
                const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if(value && !pattern.test(value)){
                    $(this).find(".error").text("Invalid Email");
                    isValid = false;
                }
            }


            if(input.attr("type") === "radio"){
                const name = input.attr("name");
                if(!$(`input[name='${name}']:checked`).val()){
                    $(this).find(".error").text("Please select an option");
                    isValid = false;
                }
            }

        });

        if(isValid){
            alert("Form Submitted Successfully");
        }

    });

});

