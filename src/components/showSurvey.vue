

<script>
    export default {
        data() {
            return {
                SurveyData: undefined,
                votedOptionName: undefined,
                errormessage: undefined
            }
            
        },
        
        methods: {
            refresh() {
                let id = window.location.href.split('?')[1]
                id = new URLSearchParams(id).get("id")
                fetch("http://localhost:3333/getSurveyData?id=" + id)
                .then((res) => res.json())
                .then((data) => {
                    this.SurveyData = data.data
                    this.SurveyData.options = JSON.parse(this.SurveyData.options)
                    this.SurveyData.overAllVotes = 0;

                    //calculate overall votes
                    for (let item in this.SurveyData.options) {
                        this.SurveyData.overAllVotes += this.SurveyData.options[item];
                        
                    }
                    //calculate percentage for every vote
                    for (let option in this.SurveyData.options) {
                        console.log(this.SurveyData.options[option], this.SurveyData.overAllVotes)
                        this.SurveyData.options[option] = this.SurveyData.options[option] / this.SurveyData.overAllVotes;
                    }
                })

                //get vote
                fetch("http://localhost:3333/getVoteForIp?id=" + id)
                .then((res) => res.json())
                .then((data) => {
                    if (data.data.option != undefined) {
                        this.votedOptionName = data.data.option

                    }
                })
                
            },
            vote(opt_name) {
                if (opt_name == this.votedOptionName) {
                    this.votedOptionName = undefined
                } else {
                    this.votedOptionName = opt_name
                }
                let id = window.location.href.split('?')[1]
                id = new URLSearchParams(id).get("id")
                console.log(opt_name, id)
                fetch("http://localhost:3333/addOptionVote", {
                    method: "POST",
                    headers: {
                        'content-type': 'application/json'
                    },
                    body: JSON.stringify({
                        option: opt_name,
                        id: id
                    })
                })
              
                .then((res) => res.json())
                .then((data) => {
                    console.log(data)
                    if (data.Code != 202) {
                        this.errormessage = "There was a problem with changing/making the choice"
                    } else {
                        this.errormessage = undefined
                    }
                    this.refresh();

                })
            }
        },
        created() {
            this.refresh()
        }
        

    }
    

</script>
<template>
    <div class="survey" v-if="this.SurveyData">
        <p class="tittle">{{SurveyData.tittle}}</p>
        <p class="description">{{SurveyData.description}}</p>
        <div class="options">
            <div class="option" v-for="(percentage, name) in SurveyData.options">
                <p v-if="name == this.votedOptionName && this.votedOptionName != undefined"><input type="checkbox" @click="vote(name)" checked name="option">{{name}}  <progress :value='percentage || 0'></progress> <span class="percentage">{{Math.trunc(percentage * 100) || 0}}%</span> </p>
                <p v-else><input  @click="vote(name)" type="checkbox" name="option">{{name}}  <progress :value='percentage || 0'></progress> <span class="percentage">{{Math.trunc(percentage* 100) || 0}}%</span>  </p>
            </div>
        </div>
        <p class="error" v-if="this.errormessage">{{this.errormessage}}</p>
    </div>
</template>


<style>
    .survey {
        background-color: #4b4b4b;
        padding: 4px;
        padding-left: 10px;
        padding-right: 10px;
        border-radius: 10px;
        max-width: 900px;
        margin: auto;
        color: #bdbdbd;

    }
    .survey > .tittle {
        font-size: 2em;
        border-bottom: 2px solid #bdbdbd;
        padding-bottom: 5px;
    }
    .survey > .description {
        font-size: 1.25em;
    }
    progress {
        background-color: rgb(83, 39, 39);
    }
    
    progress::-webkit-progress-value {
        background-color: #3ae374;
    } 
    progress::-moz-progress-bar {
        background-color: #000;
    }
</style>