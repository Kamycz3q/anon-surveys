<script>






export default {
    data() {
        return{ 
            test: 3,
            mysurveys: []
        }
    },
    mounted() {
        this.mysurveys = JSON.parse(localStorage.getItem("surveysArray") || "[]").reverse() ;
        console.log(this.mysurveys)
    },
    methods: {
        href(link) {
            console.log(link)
            window.location.href = link
        }
    }
    
}




</script>

<template>
    <div class="your-surveys">
        <div class="header">
            <h3>Your surveys</h3>
            <div class="custom-hr"></div>
        </div>
        <p v-if="this.mysurveys.length == 0">No surveys :(</p>
        <div class="surveys" v-for="item in mysurveys" >
            <div>
                <h1>{{item.name}}</h1>
                <p>{{item.description}}</p>
                <br>
                <button @click="href(item.link)">Go to survey</button>
            </div>
        </div>
    </div>
    <br>
    <div class="addSurveyBtn"><a href="#/addSurvey">Add Survey</a></div>

    
</template>

<style>

    .addSurveyBtn {
        background-color: #3ae374;
        padding: 4px;
        padding-left: 15%;
        padding-right: 15%;
        cursor: pointer;
        text-align: center;
        border: 1px solid transparent;
        border-radius: 5px;
        margin: 0 auto;
        max-width: 300px;
    }
    .addSurveyBtn a {
        color: #333333;
        font-size: 1em;
        text-decoration: none;
    }

</style>