
<script>
export default {
    data() {
        return {
            optlist: {0: "Option", 1: "Option 2"},
            errors: {"Tittle": "", "Description": "", "Options":""},
            sending: false,
            surveybtnData: "Create survey"
        }
    },
    
    methods: {
        addOption() {
            this.optlist[this.lengthOfAssoc(this.optlist)] = "Option " + (this.lengthOfAssoc(this.optlist) + 1)

        },
        del(item) {
            for (let option in this.optlist) {
                if (this.optlist[option] == item) {
                    delete(this.optlist[option])
                }
            }
            
        },
        TransferOptions() {
            let newOptions = []
            for (let item in this.optlist) {
                newOptions.push(this.optlist[item])

            }
            this.optlist = newOptions
        },
        inputsCheck(option) {
            switch(option) {

                case "tittle": {
                    let tittle = document.querySelector("input[name=Tittle]").value
                    if (tittle.length <= 2) {
                        this.errors.Tittle = "- Set tittle to minimum 3 characters!"
                    }  else {
                        this.errors.Tittle = "";
                    }
                    break;
                }
                case "description": {
                    let description = document.querySelector("input[name=Description]").value
                    if (description.length <= 9) {
                        this.errors.Description = "- Set description to minimum 10 characters!"
                    }  else {
                        this.errors.Description = "";
                    }
                    break;
                }
                case "options": {
                    if (this.lengthOfAssoc(this.optlist) <= 1) {
                        this.errors.Options = "- You must have minimum 2 options to choose"
                    } else {
                        this.errors.Options = ""
                    }
                }
            }
            
        },
        changeOptionName(opt_name) {
            console.log(opt_name)
            this.optlist[opt_name] = document.querySelector(`input[v-model='${opt_name}']`).value         
            console.log(this.optlist)   
        },
        lengthOfAssoc(array){
            let count = 0;
            for (let item in array) {
                count++;
            }
            return count;
        },  

        addSurveySubmit(event) {
            event.preventDefault();
            //check creatorname
            this.inputsCheck("tittle");
            this.inputsCheck("description");
            this.inputsCheck("options");
            let canSubmit = true;
            for (const error in this.errors) {
                

                if (this.errors[error] != "") {
                    canSubmit = false;
                }
            }
            if (!canSubmit || this.sending == true) return;
            this.sending = true
            this.surveybtnData = "Sending survey..."
            
            
           
            this.TransferOptions();
            const postRequest = fetch("http://localhost:3333/addSurvey", {
                method: "POST",
                headers: {
                    'content-type': 'application/json'
                },

                
                body: JSON.stringify({tittle: document.querySelector("input[name=Tittle]").value,
                description: document.querySelector("input[name=Description]").value,
                "options": this.optlist
            
                })
            })

            postRequest.then((res) => res.json())
            .then((data) => {
                if (data.data != undefined) {
                    let seconds = 1
                    this.surveybtnData = `Successfully sent survey! Redirecting in ${seconds} seconds...`
                    
                    if (localStorage.getItem("surveysArray") != undefined) {
                        let newlocalStorage = JSON.parse(localStorage.getItem("surveysArray"))
                        console.log(newlocalStorage)
                        newlocalStorage.push({name: document.querySelector("input[name=Tittle]").value, description:document.querySelector("input[name=Description]").value, link:`#/showSurvey?id=${data.data.newId}`})
                        localStorage.setItem("surveysArray", JSON.stringify(newlocalStorage))
                    } else {
                        localStorage.setItem("surveysArray", JSON.stringify([{name: document.querySelector("input[name=Tittle]").value, description:document.querySelector("input[name=Description]").value, link:`#/showSurvey?id=${data.data.newId}`}]) )

                    }
                    let secInterval = setInterval(() => {
                        if (seconds > 0) {
                            seconds -= 1
                            this.surveybtnData = `Successfully sent survey! Redirecting in ${seconds} seconds...`
                        }
                        else{
                            
                            
                            window.location.href = "./"
                            clearInterval(secInterval)
                        }
                    }, 1000)
                }

            })
            

        }

    }
}

</script>

<template>
    <form method="post" @submit="addSurveySubmit">
        
        <label for="Tittle">Tittle</label>
        <br><br>
        <input type="text" @input="inputsCheck('tittle')" name="Tittle" placeholder="Tittle">
        <p class="form-error">{{errors.Tittle}}</p>
        <br>
        <label for="Description">Description</label>
        <br><br>
        <input type="text" name="Description"  @input="inputsCheck('description')" placeholder="Short description">
        <p class="form-error">{{errors.Description}}</p>
        <br>
        <!-- opcje -->

        <label for="item">Options</label>
        <div v-for="(item, id) in optlist" class="item">
            <input type="text" class="item-name" :v-model="id" :value="item" @input="changeOptionName(id)" placeholder="Option name"/><button @click="del(item);inputsCheck('options')">X</button>
        </div>
        <button type="button" class="addOptionBtn" @click="addOption();inputsCheck('options')" v-if="this.lengthOfAssoc(this.optlist) < 5">Add option</button>
        <p class="form-error">{{errors.Options}}</p>
        <input type="submit" :value="surveybtnData">
    </form>
</template>


<style>
    form {
        padding: 10px;
        background-color: #333333;
        max-width: 900px;
        margin: auto;
    }
    form > label {
        color: aliceblue;
        margin-bottom: 2px;
        border: 1px solid transparent;
    }
    form input[type="text"] {
        width: 99%;
        background-color: transparent;
        outline: none;
        border: 1px solid transparent;
        padding: 3px;
        color: #8f8f8f;
        border-bottom: 1px solid rgb(158, 158, 158);
        transition: 250ms all;
    }
    form > input[type="text"]:focus {
        border-bottom: 1px solid rgb(255, 255, 255);
        outline: none;
        color: #ffffff;

    }
    form > input[type="text"]::placeholder {
        color: #8f8f8f;

    }
    form > input[type="text"]:hover {
        outline: none;
        color: rgb(255, 255, 255);

        border-bottom: 1px solid rgb(255, 255, 255);
    }
    form > input[type="text"]:hover::placeholder {
        outline: none;
        color: rgb(255, 255, 255);

    }
    .item {
        
        margin: 10px;
        font-size: 1.25em;
        color: #8f8f8f;
        transition: 250ms all;
    }
    .item > input {
        width: 75%;
        border-bottom: 1px solid transparent;
    }
    .item:hover {
        color: #ffffff;

    }
    .item > button {
        display: inline;
        float: right;
        background-color: transparent;
        color: #8f8f8f;
        cursor: pointer;
        border: 1px solid transparent;
    }
    .item > button:hover {
        color: #ffffff;

    }
    .item > input:hover {
        outline: none;
        color: rgb(255, 255, 255);

    }
    .item > input:focus {
        outline: none;
        color: rgb(255, 255, 255);

    }
    .item > .item-name {
        width: 75%;
        border-bottom: transparent;
    }
    .addOptionBtn {
        border-bottom: 1px solid transparent;
        margin: 10px;
        font-size: 1.1em;
        color: #8f8f8f;
        transition: 250ms all;
    }
    .addOptionBtn:hover {
        color: #ffffff;

    }
    .addOptionBtn {
        background-color: transparent;
        color: #8f8f8f;
        cursor: pointer;
        border: 1px solid transparent;
    }

    form > input[type="submit"] {
        width: 100%;
        background-color: transparent;
        color: #8f8f8f;
        cursor: pointer;
        border: 1px solid transparent;
        transition: 250ms all;
        font-size: 1em;
    }
    form > input[type="submit"]:hover {
        color: #ffffff;

    }

    form > .form-error {
        color: #e74c3c;
        margin: 5px;
        font-size: 0.9em;
    }
    
</style>