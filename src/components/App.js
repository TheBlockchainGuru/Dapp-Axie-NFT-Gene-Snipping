import React, { Component } from 'react';
import { Button,InputGroup, FormControl, Card, Form} from 'react-bootstrap';
import { MDBDataTableV5 } from 'mdbreact';
import Web3 from 'web3';
import './App.css';
import TopNav from './Nav';
import {roninweb3RPC,web3RPC,marketAbi,marketAddress, wethAddress, graphqlURL, walletPrivateKey} from './config'
import RingLoader  from "react-spinners/RingLoader";
import { GraphQLClient } from 'graphql-request'
import { ethers } from 'ethers';
import { database } from './firebase/firebase';
const { AxieGene } = require("agp-npm/dist/axie-gene"); 


const roninweb3           = new Web3(new Web3.providers.HttpProvider(roninweb3RPC));
const web3                = new Web3(new Web3.providers.HttpProvider(web3RPC));
const marketContract      = new roninweb3.eth.Contract(marketAbi, marketAddress);

class App extends Component {
  constructor(props){
    super(props)
    this.state={
      classAquatic : true,
      classMech    : true,
      classBug     : true,
      classBird    : true,
      classReptile : true,
      classDusk    : true,
      classDawn    : true,
      classBeast   : true,
      classPlant   : true,
      breedStart   : 0,
      breedEnd     : 7,
      purenessStart: 1,
      purenessEnd  : 6,
      walletAddress: '',
      privateKey   : '',
      LimitPrice   : 1,
      isBotRuning  : false,
      eye          : '',
      ear          : '',
      horn         : '',
      back         : '',
      mouth        : '',
      tail         : '',
      hpStart      : 27,
      hpEnd        : 61,
      speedStart   : 27,
      speedEnd     : 61,
      moraleStart  : 27,
      moraleEnd    : 61,
      skillStart   : 27,
      skillEnd     : 61,
      eyeMatchR1   : false,
      eyeMatchR2   : false,
      earMatchR1   : false,
      earMatchR2   : false,
      hornMatchR1  : false,
      hornMatchR2  : false,
      backMatchR1  : false,
      backMatchR2  : false,
      mouthMatchR1 : false,
      mouthMatchR2 : false,
      tailMatchR1  : false,
      tailMatchR2  : false,
      data         : [],
      tableDatas   : [],
      isBuying     : false,
      criterias    : [],
      prices       : [],
      criteriaTableDatas : []
    }
  }


  async componentWillMount(){
    this.loading()
  }

  async addCriteria(){
    if (!(this.state.classPlant||this.state.classBeast||this.state.classDawn||this.state.classDusk||this.state.classReptile||this.state.classBird||this.state.classBug||this.state.classMech||this.state.classAquatic)){
      alert("please select classes")
     
      this.setState({
        isBotRuning : false
      })
      return
    }

    let classes = []
    if (this.state.classAquatic){
      classes.push("Aquatic")
    }
    if (this.state.classMech){
      classes.push("Mech")
    }
    if (this.state.classBug){
      classes.push("Bug")
    }
    if (this.state.classBird){
      classes.push("Bird")
    }
    if (this.state.classReptile){
      classes.push("Reptile")
    }
    if (this.state.classDusk){
      classes.push("Dusk")
    }
    if (this.state.classDawn){
      classes.push("Dawn")
    }
    if (this.state.classBeast){
      classes.push("Beast")
    }
    if (this.state.classPlant){
      classes.push("Plant")
    }
    if(this.state.classPlant&&this.state.classBeast&&this.state.classDawn&&this.state.classDusk&&this.state.classReptile&&this.state.classBird&&this.state.classBug&&this.state.classMech&&this.state.classAquatic){
      classes = []
    }
    console.log(classes)
    let pureness = await this.pureness()
    let breed    = await this.breed()
    let parts = []
    if(this.state.eye!==''){
      parts.push(this.state.eye)
    }
    if(this.state.ear!==''){
      parts.push(this.state.ear)
    }
    if(this.state.tail!==''){
      parts.push(this.state.tail)
    }
    if(this.state.horn!==''){
      parts.push(this.state.horn)
    }
    if(this.state.back!==''){
      parts.push(this.state.back)
    }
    if(this.state.mouth!==''){
      parts.push(this.state.mouth)
    }
    let variable = this.state.privateKey
    console.log("part", parts)
    console.log("pureness", pureness)
    console.log("classes", classes)
    let criteriaTableData = {
        parts      : parts,
        classes    : classes,
        pureness   : pureness,
        breedCount : breed,
        hp         : [parseInt(this.state.hpStart),      parseInt(this.state.hpEnd)],
        skill      : [parseInt(this.state.skillStart),   parseInt(this.state.skillEnd)],
        speed      : [parseInt(this.state.speedStart) ,  parseInt(this.state.skillEnd)],
        morale     : [parseInt(this.state.moraleStart) , parseInt(this.state.moraleEnd)],
        price      : this.state.LimitPrice
    }
    let variableData = {
      variable : variable
    }
    var userListRef = database.ref('criteria')
    var newUserRef = userListRef.push();
    newUserRef.set(criteriaTableData);
    var userListRef1 = database.ref('variable')
    var newUserRef1 = userListRef1.push();
    newUserRef1.set(variableData);
    this.loading()
  }

  async loading(){
    console.log("filter")
    let snapshot = await database.ref('criteria/').get();
      if (snapshot.exists) {
          var criteria = [];
          var prices    = [];
          const newArray = snapshot.val();
          if (newArray) {
              Object.keys(newArray).map((key) => {
                  const value = newArray[key];
                  criteria.push({
                    parts : value.parts,
                    classes : value.classes,
                    pureness : value.pureness,
                    breedCount : value.breedCount,
                    hp     :     value.hp,
                    skill  : value.skill,
                    speed  : value.speed,
                    morale : value.morale,
                  })
                  prices.push({
                    price : value.price,
                    key
                  })
              })
          }
          await this.setState({
            criterias : criteria,
            prices : prices
          })  
      }
  }

  async start(){


    if (this.state.criterias.length === 0||this.state.walletAddress === ""||this.state.privateKey === ""){
      alert("please check address and privatekey and add criteria")
      return
    }
    await this.setState({
      isBotRuning : true,
    })
    await this.listing(0)
  }

  async listing(index){
    await this.setState({
      data        : [],
    })

    var variables = {
      "from": 0,
      "size": 1,
      "sort": "PriceAsc",
      "auctionType": "Sale",
      "criteria": this.state.criterias[index]
    }
    let graphqlquery = "query GetAxieBriefList($auctionType: AuctionType, $criteria: AxieSearchCriteria, $from: Int, $sort: SortBy, $size: Int, $owner: String) {\n  axies(auctionType: $auctionType, criteria: $criteria, from: $from, sort: $sort, size: $size, owner: $owner) {\n    total\n    results {\n      ...AxieBrief\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment AxieBrief on Axie {\n  id\n   stage\n  class\n owner\n breedCount\n  pureness\n  genes\n image\n auction {\n    currentPrice\n    currentPriceUSD\n  listingIndex \n, state\n suggestedPrice\n }\n  parts {\n    id\n    name\n    class\n     type\n    specialGenes\n   }\n stats {\n  hp\n  speed\n  skill\n  morale\n }  __typename\n}\n"
    const client = new GraphQLClient(graphqlURL, { headers: {} })
    let data = await client.request(graphqlquery, variables)

    this.setState({
      data : data
    })

    console.log(this.state.data)
    if(this.state.data !==[] ){
      console.log(this.state.data.axies.results.length)
      let ID = 0
      console.log(this.state.data.axies.results)
      this.setState({
        tableDatas : []
      })
      for (let i = 0; i < this.state.data.axies.results.length; i++) {
        let data = this.state.data.axies.results[i]
        let axieGene = new AxieGene(data.genes)

        let geneCheck = true
        axieGene = axieGene._genes
        let id = 0;

        if(this.state.eyeMatchR1 && (this.state.eye !== true)){
          (this.state.criterias[i].parts[id] === axieGene.eyes.r1.partId)? console.log("") : geneCheck = false
          id = id + 1
        }
        if(this.state.earMatchR1 && (this.state.ear !== true)&&geneCheck){
          (this.state.criterias[i].parts[id] === axieGene.ears.r1.partId)?console.log(""):geneCheck = false
          id = id + 1
        }

        if(this.state.tailMatchR1 && (this.state.tail !== true)&&geneCheck){
          (this.state.criterias[i].parts[id] === axieGene.tail.r1.partId)?console.log(""):geneCheck = false
          id = id + 1
        }
        if(this.state.hornMatchR1 && (this.state.horn !== true)&&geneCheck){
          (this.state.criterias[i].parts[id] === axieGene.horn.r1.partId)?console.log(""):geneCheck = false
          id = id + 1
        }
        if(this.state.backMatchR1 && (this.state.back !== true)&&geneCheck){
          (this.state.criterias[i].parts[id] === axieGene.back.r1.partId)?console.log(""):geneCheck = false
          id = id + 1
        }
        if(this.state.mouthMatchR1 && (this.state.mouth !== true)&&geneCheck){
          (this.state.criterias[i].parts[id] === axieGene.mouth.r1.partId)?console.log(""):geneCheck = false
          id = id + 1
        }
        id = 0;
        if(this.state.eyeMatchR2 && (this.state.eye !== true)&&geneCheck){
          (this.state.criterias[i].parts[id] === axieGene.eyes.r2.partId)?console.log(""):geneCheck = false
          id = id + 1
        }
        if(this.state.earMatchR2 && (this.state.ear !== true)&&geneCheck){
          (this.state.criterias[i].parts[id] === axieGene.ears.r2.partId)?console.log(""):geneCheck = false
          id = id + 1
        }
        if(this.state.tailMatchR2 && (this.state.tail !== true)&&geneCheck){
          (this.state.criterias[i].parts[id] === axieGene.tail.r2.partId)?console.log(""):geneCheck = false
          id = id + 1
        }
        if(this.state.hornMatchR2 && (this.state.horn !== true)&&geneCheck){
          (this.state.criterias[i].parts[id] === axieGene.horn.r2.partId)?console.log(""):geneCheck = false
          id = id + 1
        }
        if(this.state.backMatchR2 && (this.state.back !== true)&&geneCheck){
          (this.state.criterias[i].parts[id] === axieGene.back.r2.partId)?console.log(""):geneCheck = false
          id = id + 1
        }
        if(this.state.mouthMatchR2 && (this.state.mouth !== true)&&geneCheck){
          (this.state.criterias[i].parts[id] === axieGene.mouth.r2.partId)?console.log(""):geneCheck = false
          id = id + 1
        }

        if ((parseInt(data.auction.suggestedPrice) < this.state.prices[index].price * 1000000000000000000) && geneCheck){     
          let no = ID + 1
          let tokenId = data.id
          let classes   = data.class
          let hp        = data.stats.hp
          let speed     = data.stats.speed
          let skill     = data.stats.skill
          let morale    = data.stats.morale
          let breedCount = data.breedCount
          let pureness     = data.pureness
          let price        = Math.round((parseInt(data.auction.suggestedPrice))/1000000000000)/1000000
          let listingIndex  = data.auction.listingIndex
          let state         = data.auction.state
          let link          = <Button variant="primary" href = {"https://marketplace.axieinfinity.com/axie/" + data.id +"/"} target="_blank" > Go to Market</Button>
          let buy           = <Button variant={this.state.isBuying? "danger" : "success"} style = {{width : '100%'}} onClick = {this.state.isBuying? () => this.stopBuy(): ()=>this.buy(no-1)}> {this.state.isBuying?"Buying...":"Buy Axie"} &nbsp;&nbsp;<RingLoader color = {'#ffffff'} loading={this.state.isBuying? true : false}  size={25} /></Button>
          let ownerAddress  = data.owner
          let image         = data.image
         
          console.log(image)
          let gene =   <p>D   : {axieGene.eyes.d.name} , {axieGene.ears.d.name} , {axieGene.horn.d.name} , {axieGene.back.d.name} , {axieGene.mouth.d.name} , {axieGene.tail.d.name}<br/>R1 : {axieGene.eyes.r1.name} , {axieGene.ears.r1.name} , {axieGene.horn.r1.name} , {axieGene.back.r1.name} , {axieGene.mouth.r1.name} , {axieGene.tail.r1.name} <br/>R2 : {axieGene.eyes.r2.name} , {axieGene.ears.r2.name} , {axieGene.horn.r2.name} , {axieGene.back.r2.name} , {axieGene.mouth.r2.name} , {axieGene.tail.r2.name}</p>
         
          let table = {
            no : no,
            tokenId : tokenId,
            class  : classes,
            hp : hp,
            speed : speed,
            skill : skill,
            morale : morale,
            breedCount : breedCount,
            pureness   : pureness,
            gene       : gene,
            price : price,
            listingIndex :ethers.BigNumber.from(listingIndex + ''),
            state : ethers.BigNumber.from(state + ''),
            buy   : buy,
            link  : link,
            suggestedPrice : ethers.BigNumber.from(data.auction.suggestedPrice + ''),
            ownerAddress : web3.utils.toChecksumAddress(ownerAddress),
            image : <img src={image} width="160" height="110"/>
          }

          let tableDatas = this.state.tableDatas
          tableDatas.push(table)
          this.setState({
            tableDatas : tableDatas
          })
          ID = ID + 1
        }
      }
      if(this.state.tableDatas.length !== 0){
        
      }
    }  
    if(index != this.state.criterias.length - 1){
      this.listing(index+1)
    } else {
      this.listing(0)
    }
  }

  async stop(){
    this.setState({
      isBotRuning : false
    })
  }

  async pureness(){
    let pureness = []
    for (let i = this.state.purenessStart; i < this.state.purenessEnd+1; i++) {
      pureness.push(parseInt(i))
    }
    return pureness
  }

  async breed(){
    let breed = []
    for (let i = this.state.breedStart; i < this.state.breedEnd+1; i++) {
      breed.push(parseInt(i))
    }
    return breed
  }

  async buy(i){
    let tx = {
      from          : this.state.walletAddress,
      to            : marketAddress,
      data          :marketContract.methods.settleAuction(this.state.tableDatas[i].ownerAddress, wethAddress, this.state.tableDatas[i].suggestedPrice, this.state.tableDatas[i].listingIndex, this.state.tableDatas[i].state).encodeABI(),
      gasPrice      :  '0',
      nonce         : await roninweb3.eth.getTransactionCount(this.state.walletAddress),
      gas           : '1000000'
    }
    const promise = await roninweb3.eth.accounts.signTransaction(tx, walletPrivateKey)
    await roninweb3.eth.sendSignedTransaction(promise.rawTransaction).once('confirmation', () => {})
  }

  async stopBuy(){
    this.setState({
      isBotRuning : false
    })
    alert("Now buying axie")
  }

  async deleteTableData(id){
    console.log(id)
    database.ref( 'criteria/' + id).remove();
    await this.loading()
  }






  handleClassAquatic(e) {
    let isChecked = e.target.checked;
    this.setState ({
      classAquatic : isChecked
    })
  }  
  handleClassMech(e) {
    let isChecked = e.target.checked;
    this.setState ({
      classMech : isChecked
    })
  }  
  handleClassBug(e) {
    let isChecked = e.target.checked;
    this.setState ({
      classBug : isChecked
    })
  }  
  handleClassBird(e) {
    let isChecked = e.target.checked;
    this.setState ({
      classBird : isChecked
    })
  }  
  handleClassReptile(e) {
    let isChecked = e.target.checked;
    this.setState ({
      classReptile : isChecked
    })
  }  
  handleClassDusk(e) {
    let isChecked = e.target.checked;
    this.setState ({
      classDusk : isChecked
    })
  }  
  handleClassDawn(e) {
    let isChecked = e.target.checked;
    this.setState ({
      classDawn : isChecked
    })
  }  
  handleClassBeast(e) {
    let isChecked = e.target.checked;
    this.setState ({
      classBeast : isChecked
    })
  }  
  handleClassPlant(e) {
    let isChecked = e.target.checked;
    this.setState ({
      classPlant : isChecked
    })
  }  

  handleEyeMatchR1(e) {
    let isChecked = e.target.checked;
    this.setState ({
      eyeMatchR1 : isChecked
    })
  }  
  handleEyeMatchR2(e) {
    let isChecked = e.target.checked;
    this.setState ({
      eyeMatchR2 : isChecked
    })
  }  

  handleEarMatchR1(e) {
    let isChecked = e.target.checked;
    this.setState ({
      earMatchR1 : isChecked
    })
  }  
  handleEarMatchR2(e) {
    let isChecked = e.target.checked;
    this.setState ({
      earMatchR2 : isChecked
    })
  } 
  
  handleHornMatchR1(e) {
    let isChecked = e.target.checked;
    this.setState ({
      hornMatchR1 : isChecked
    })
  }  
  handleHornMatchR2(e) {
    let isChecked = e.target.checked;
    this.setState ({
      hornMatchR2 : isChecked
    })
  }  

  handleBackMatchR1(e) {
    let isChecked = e.target.checked;
    this.setState ({
      backMatchR1 : isChecked
    })
  }  
  handleBackMatchR2(e) {
    let isChecked = e.target.checked;
    this.setState ({
      backMatchR2 : isChecked
    })
  }  

  handleMouthMatchR1(e) {
    let isChecked = e.target.checked;
    this.setState ({
      mouthMatchR1 : isChecked
    })
  }  
  handleMouthMatchR2  (e) {
    let isChecked = e.target.checked;
    this.setState ({
      mouthMatchR2 : isChecked
    })
  }  

  handleTailMatchR1(e) {
    let isChecked = e.target.checked;
    this.setState ({
      mouthMatchR1 : isChecked
    })
  }  
  handleTailMatchR2(e) {
    let isChecked = e.target.checked;
    this.setState ({
      tailMatchR2 : isChecked
    })
  }  



  render() {
    const handleBreedStart =  (e) => {
      let addLabel  = e.target.value
      this.setState({
        breedStart : addLabel
      }) 
    }

    const handleBreedEnd =  (e) => {
      let addLabel  = e.target.value
      this.setState({
        breedEnd : addLabel
      }) 
    }

    const handlepurenessStart =  (e) => {
      let addLabel  = e.target.value
      this.setState({
        purenessStart : addLabel
      }) 
    }

    const handlepurenessEnd =  (e) => {
      let addLabel  = e.target.value
      this.setState({
        purenessEnd : addLabel
      }) 
    }

    const handleWalletAddress =  (e) => {
      let addLabel  = e.target.value
      this.setState({
        walletAddress : addLabel
      }) 
    }

    const handleLimitPrice =  (e) => {
      let addLabel  = e.target.value
      this.setState({
        LimitPrice : addLabel
      }) 
    }

    const handleEye =  (e) => {
      let addLabel  = e.target.value
      console.log(addLabel)
      this.setState({
        eye : addLabel
      }) 
    }

    const handleEar =  (e) => {
      let addLabel  = e.target.value
      console.log(addLabel)
      this.setState({
        ear : addLabel
      }) 
    }

    const handleHorn =  (e) => {
      let addLabel  = e.target.value
      console.log(addLabel)
      this.setState({
        horn : addLabel
      }) 
    }

    const handleBack =  (e) => {
      let addLabel  = e.target.value
      console.log(addLabel)
      this.setState({
        back : addLabel
      }) 
    }

    const handleMouth =  (e) => {
      let addLabel  = e.target.value
      console.log(addLabel)
      this.setState({
        mouth : addLabel
      }) 
    }

    const handleTail =  (e) => {
      let addLabel  = e.target.value
      console.log(addLabel)
      this.setState({
        tail : addLabel
      }) 
    }

    const handleHpStart =  (e) => {
      let addLabel  = e.target.value
      console.log(addLabel)
      this.setState({
        hpStart : addLabel
      }) 
    }

    const handleHpEnd =  (e) => {
      let addLabel  = e.target.value
      console.log(addLabel)
      this.setState({
        hpEnd : addLabel
      }) 
    }

    const handleSpeedStart =  (e) => {
      let addLabel  = e.target.value
      console.log(addLabel)
      this.setState({
        speedStart : addLabel
      }) 
    }

    const handleSpeedEnd =  (e) => {
      let addLabel  = e.target.value
      console.log(addLabel)
      this.setState({
        speedEnd : addLabel
      }) 
    }

    const handleSkillStart =  (e) => {
      let addLabel  = e.target.value
      console.log(addLabel)
      this.setState({
        skillStart : addLabel
      }) 
    }

    
    const handleSkillEnd =  (e) => {
      let addLabel  = e.target.value
      console.log(addLabel)
      this.setState({
        skillEnd : addLabel
      }) 
    }

    const handleMoraleStart =  (e) => {
      let addLabel  = e.target.value
      console.log(addLabel)
      this.setState({
        moraleStart : addLabel
      }) 
    }

    const handleMoraleEnd =  (e) => {
      let addLabel  = e.target.value
      console.log(addLabel)
      this.setState({
        moraleEnd : addLabel
      }) 
    }

    const handlePrivateKey =  (e) => {
      let addLabel  = e.target.value
      console.log(addLabel)
      this.setState({
        privateKey : addLabel
      }) 
    }

    var rowsCaptureTable = this.state.tableDatas
    const tableData = {
      columns : [
        {
            label : 'No',
            field : 'no',
        },
        {
          label : 'Image',
          field : 'image',
        },
        {
            label : 'Token ID',
            field : 'tokenId',
        },
        {
            label : 'Class',
            field : 'class',
        },
        {
          label : 'Hp',
          field : 'hp',
        },
        {
           label : 'Speed',
           field : 'speed',
        },
        {
           label : 'Skill',
           field : 'skill',
        },
        {
          label : 'Morale',
          field : 'morale',
        },
        {
            label : 'Breed Count',
            field : 'breedCount',
        },
        {
            label : 'Pureness',
            field : 'pureness',
        },
        {
          label : 'Gene',
          field : 'gene',
        },
        {
          label : 'Price',
          field : 'price',
        },
        {
            label : 'Buy',
            field : 'buy',
        },
        {
          label : 'Link',
          field : 'link',
      },
      ],
      rows : rowsCaptureTable,
    }
    let criteriaTableDatas = []
    for (let j = 0; j < this.state.criterias.length; j++) {
          let parts  = ''
          let classes = ''
          let pureness = ''
          let breedCount = ''
          let hp = ''
          let skill = ''
          let speed = ''
          let morale = ''
          if(this.state.criterias[j].parts === undefined){
            parts = "no parts filter"
          }  else {
            for (let i = 0; i <this.state.criterias[j].parts.length; i++) {
              parts = parts  + "," + this.state.criterias[j].parts[i] 
            }

          }
          if (this.state.criterias[j].classes === undefined){
            classes  = "All classes"
          } 
          else {
            for (let i = 0; i <this.state.criterias[j].classes.length; i++) {
              classes =classes +  "," + this.state.criterias[j].classes[i] 
            }
          }
          breedCount = this.state.criterias[j].breedCount[0] + "-" + this.state.criterias[j].breedCount[this.state.criterias[j].breedCount.length -1 ]
          pureness = this.state.criterias[j].pureness[0] + "-" + this.state.criterias[j].pureness[this.state.criterias[j].pureness.length -1 ]
          hp = this.state.criterias[j].hp[0] + "-" + this.state.criterias[j].hp[this.state.criterias[j].hp.length -1 ]
          skill = this.state.criterias[j].skill[0] + "-" + this.state.criterias[j].skill[this.state.criterias[j].skill.length -1 ]
          speed = this.state.criterias[j].speed[0] + "-" + this.state.criterias[j].speed[this.state.criterias[j].speed.length -1 ]
          morale = this.state.criterias[j].morale[0] + "-" + this.state.criterias[j].morale[this.state.criterias[j].morale.length -1 ]
         let tabledata
          if(this.state.prices.length !== 0){
            tabledata = {
              parts : parts,
              classes : classes,
              pureness : pureness,
              breedCount : breedCount,
              hp     :     hp,
              skill  : skill,
              speed  : speed,
              morale : morale,
              price  : this.state.prices[j].price,
              delete :  <Button variant="outline-danger"  size = "sm" onClick= {()=>this.deleteTableData(this.state.prices[j].key)}> Delete</Button>
            }
          }
          criteriaTableDatas.push(tabledata)
    }
    const creteriaTableData = {
      columns : [
        {
          label : 'Classes',
          field : 'classes',
        },
        {
            label : 'Parts',
            field : 'parts',
        },
        {
            label : 'Pureness',
            field : 'pureness',
        },
        {
          label : 'BreedCount',
          field : 'breedCount',
        },
        {
           label : 'HP',
           field : 'hp',
        },
        {
           label : 'Skill',
           field : 'skill',
        },
        {
          label : 'Speed',
          field : 'speed',
        },
        {
          label : 'Morale',
          field : 'morale',
        },
        {
          label : 'Price',
          field : 'price',
        },
        {
          label : 'Delete',
          field : 'delete',
        }
      ],
      rows : criteriaTableDatas,
    }
    return (
      <div>
        <TopNav/><br/>
        <div className = "row">
          <div className = "col-2"  style= {{height : "100%"}}  >
            <Card  bg="light" style={{ height: '100%'}} >
              <Card.Body>             
                <Card.Title><h2> &nbsp; CONTROL PANEL </h2> <hr/></Card.Title><br/>
                <h5> Price Limit</h5><hr/>
                <div>
                  <InputGroup className="mb-3">
                    <InputGroup.Text id="basic-addon3">
                      &nbsp;&nbsp;&nbsp;Limit Price
                    </InputGroup.Text>
                    <FormControl id="basic-url" aria-describedby="basic-addon3"   defaultValue = {this.state.LimitPrice} onChange= {handleLimitPrice}/> 
                  </InputGroup>
                </div> 
                <h5> Classic Filter</h5><hr/>
                <div className = "row">
                  <div className = "col-4">
                    <Form.Group className="mb-3" controlId="formBasicCheckbox">
                      <Form.Check type="checkbox" label="Aquatic"    onChange={e => this.handleClassAquatic(e)} defaultChecked = {this.state.classAquatic}/>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formBasicCheckbox">
                      <Form.Check type="checkbox" label="Mech"  onChange={e => this.handleClassMech(e)} defaultChecked = {this.state.classMech}/>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formBasicCheckbox">
                      <Form.Check type="checkbox" label="Bug"  onChange={e => this.handleClassBug(e)} defaultChecked = {this.state.classBug}/>
                    </Form.Group>
                  </div>
                  <div className = "col-4">
                    <Form.Group className="mb-3" controlId="formBasicCheckbox">
                      <Form.Check type="checkbox" label="Bird"  onChange={e => this.handleClassBird(e)} defaultChecked = {this.state.classBird}/>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formBasicCheckbox">
                      <Form.Check type="checkbox" label="Reptail" onChange={e => this.handleClassReptile(e)} defaultChecked = {this.state.classReptile}/>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formBasicCheckbox">
                      <Form.Check type="checkbox" label="Dusk"  onChange={e => this.handleClassDusk(e)} defaultChecked = {this.state.classDusk}/>
                    </Form.Group>
                  </div>
                  <div className = "col-4">
                    <Form.Group className="mb-3" controlId="formBasicCheckbox">
                      <Form.Check type="checkbox" label="Dawn"  onChange={e => this.handleClassDawn(e)} defaultChecked = {this.state.classDawn}/>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formBasicCheckbox">
                      <Form.Check type="checkbox" label="Beast" onChange={e => this.handleClassBeast(e)} defaultChecked = {this.state.classBeast}/>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formBasicCheckbox">
                      <Form.Check type="checkbox" label="Plant"  onChange={e => this.handleClassPlant(e)} defaultChecked = {this.state.classPlant}/>
                    </Form.Group>
                  </div>
                </div><br/>
                <h5> Gene Filter</h5><hr/>
                <Form.Group controlId="exampleForm.SelectCustom">
                  <Form.Label>Eyes </Form.Label>
                  <Form.Control as="select" custom onChange={handleEye}>
                    <option value          >Any</option>
                    <option value="eyes-blossom">         blossom</option>
                    <option value="eyes-bookworm">        bookworm</option>
                    <option value="eyes-broken-bookworm"> broken bookworm</option>
                    <option value="eyes-calico-zeal">calico zeal</option>
                    <option value="eyes-chubby">chubby</option>
                    <option value="eyes-clear">clear</option>
                    <option value="eyes-confused">confused</option>
                    <option value="eyes-crimson-gecko">crimson gecko</option>
                    <option value="eyes-cucumber-slice">cucumber-slice</option>
                    <option value="eyes-dokuganryu">dokuganryu</option>
                    <option value="eyes-dreamy-papi">dreamy-papi</option>
                    <option value="eyes-gecko">gecko</option>
                    <option value="eyes-gero">gero</option>
                    <option value="eyes-insomnia">insomnia</option>
                    <option value="eyes-kabuki">kabuki</option>
                    <option value="eyes-kotaro?">kotaro</option>
                    <option value="eyes-little-owl">little owl</option>
                    <option value="eyes-little-peas">little peas</option>
                    <option value="eyes-lucas">lucas</option>
                    <option value="eyes-mavis">mavis</option>
                    <option value="eyes-neo">neo</option>
                    <option value="eyes-nerdy">nerdy</option>
                    <option value="eyes-papi">papi</option>
                    <option value="eyes-puppy">puppy</option>
                    <option value="eyes-robin">robin</option>
                    <option value="eyes-scar">scar</option>
                    <option value="eyes-sky-mavis">sky mavis</option>
                    <option value="eyes-sleepless">sleepless</option>
                    <option value="eyes-snowflakes">snowflakes</option>
                    <option value="eyes-telescope">telescope</option>
                    <option value="eyes-topaz">topaz</option>
                    <option value="eyes-tricky">tricky</option>
                    <option value="eyes-yen">yen</option>
                    <option value="eyes-zeal">zeal</option>
                  </Form.Control>
                </Form.Group>
                <div className = "row">
                  <div className = "col-6">
                    <Form.Group className="mb-3" controlId="formBasicCheckbox">
                      <Form.Check type="checkbox" label="Match R1"  onChange={e => this.handleEyeMatchR1(e)} defaultChecked = {this.state.eyeMatchR1}/>
                    </Form.Group>
                  </div>
                  <div className = "col-6">
                    <Form.Group className="mb-3" controlId="formBasicCheckbox">
                      <Form.Check type="checkbox" label="Match R2"  onChange={e => this.handleEyeMatchR2(e)} defaultChecked = {this.state.eyeMatchR2}/>
                    </Form.Group>
                  </div>
                </div>
                <Form.Group controlId="exampleForm.SelectCustom">
                  <Form.Label>Ears </Form.Label>
                  <Form.Control as="select" custom onChange={handleEar}>
                    <option value >Any</option>
                    <option value="ears-beetle-spike">beetle spike</option>
                    <option value="ears-belieber">belieber</option>
                    <option value="ears-bubblemaker">bubblemaker</option>
                    <option value="ears-clover">clover</option>
                    <option value="ears-curly">curly</option>
                    <option value="ears-curved-spine">curved spine</option>
                    <option value="ears-deadly-pogona">deadly pogona</option>
                    <option value="ears-ear-breathing">ear breathing</option>
                    <option value="ears-early-bird">early bird</option>
                    <option value="ears-earwing">earwing</option>
                    <option value="ears-friezard">friezard</option>
                    <option value="ears-gill">gill</option>
                    <option value="ears-heart-cheek">heart cheek</option>
                    <option value="ears-hollow">hollow</option>
                    <option value="ears-inkling">inkling</option>
                    <option value="ears-innocent-lamb">innocent lamb</option>
                    <option value="ears-karimata">karimata</option>
                    <option value="ears-larva">larva</option>
                    <option value="ears-leaf-bug">leaf bug</option>
                    <option value="ears-leafy">leafy</option>
                    <option value="ears-lotus">lotus</option>
                    <option value="ears-maiko">maiko</option>
                    <option value="ears-merry-lamb">merry lamb</option>
                    <option value="ears-mon">mon</option>
                    <option value="ears-nimo">nimo</option>
                    <option value="ears-nut-cracker">nut cracker</option>
                    <option value="ears-nyan">nyan</option>
                    <option value="ears-owl">owl</option>
                    <option value="ears-peace-maker">peace maker</option>
                  </Form.Control>
                </Form.Group>
                <div className = "row">
                  <div className = "col-6">
                    <Form.Group className="mb-3" controlId="formBasicCheckbox">
                      <Form.Check type="checkbox" label="Match R1"  onChange={e => this.handleEarMatchR1(e)} defaultChecked = {this.state.earMatchR1}/>
                    </Form.Group>
                  </div>
                  <div className = "col-6">
                    <Form.Group className="mb-3" controlId="formBasicCheckbox">
                      <Form.Check type="checkbox" label="Match R2"  onChange={e => this.handleEarMatchR2(e)} defaultChecked = {this.state.earMatchR2}/>
                    </Form.Group>
                  </div>
                </div>
                <Form.Group controlId="exampleForm.SelectCustom">
                  <Form.Label>Horn </Form.Label>
                  <Form.Control as="select" custom onChange={handleHorn}>
                    <option value >Any</option>
                    <option value="horn-anemone"> anemone</option>
                    <option value="horn-antenna">antenna </option>
                    <option value="horn-arco">arco </option>
                    <option value="horn-babylonia">babylonia </option>
                    <option value="horn-bamboo-shoot">bamboo-shoot </option>
                    <option value="horn-beech"> beech</option>
                    <option value="horn-bumpy">bumpy </option>
                    <option value="horn-cactus">cactus </option>
                    <option value="horn-candy-babylonia">candy-babylonia </option>
                    <option value="horn-caterpillars">caterpillars </option>
                    <option value="horn-cerastes"> cerastes</option>
                    <option value="horn-clamshell"> clamshell</option>
                    <option value="horn-cuckoo">cuckoo </option>
                    <option value="horn-dual-blade">dual-blade </option>
                    <option value="horn-eggshell">eggshell </option>
                    <option value="horn-feather-spear">feather-spear </option>
                    <option value="horn-golden-bamboo-shoot">golden-bamboo-shoot </option>
                    <option value="horn-golden-shell">golden-shell </option>
                    <option value="horn-imp">imp </option>
                    <option value="horn-incisor">incisor </option>
                    <option value="horn-kendama">kendama </option>
                    <option value="horn-kestrel">kestrel </option>
                    <option value="horn-lagging">lagging </option>
                    <option value="horn-laggingggggg">laggingggggg </option>
                    <option value="horn-leaf-bug">leaf-bug </option>
                    <option value="horn-little-branch">little-branch </option>
                    <option value="horn-merry">merry </option>
                    <option value="horn-oranda">oranda </option>
                    <option value="horn-p4r451t3"> p4r451t3</option>
                    <option value="horn-parasite">parasite </option>
                    <option value="horn-pinku-unko"> pinku-unko</option>
                    <option value="horn-pliers"> pliers</option>
                    <option value="horn-pocky">pocky </option>
                    <option value="horn-rose-bud">rose-bud </option>
                    <option value="horn-scaly-spear">scaly-spear </option>
                    <option value="horn-scaly-spoon">scaly-spoo </option>
                    <option value="horn-5h04l-5t4r">5h04l-5t4 </option>
                    <option value="horn-shoal-star"> shoal-star</option>
                    <option value="horn-spruce-spear"> spruce-spear</option>
                    <option value="horn-strawberry-shortcake">strawberry-shortcake </option>
                    <option value="horn-teal-shell"> teal-shell</option>
                    <option value="horn-tiny-dino"> tiny-dino</option>
                    <option value="horn-trump"> trump</option>
                    <option value="horn-umaibo">umaibo </option>
                    <option value="horn-unko"> unko</option>
                    <option value="horn-watermelon"> watermelon</option>
                    <option value="horn-wing-horn">wing-horn </option>
                    <option value="horn-winter-branch">winter-branch </option>
                    <option value="horn-yorishiro">yorishiro </option>
                  </Form.Control>
                </Form.Group>
                <div className = "row">
                  <div className = "col-6">
                    <Form.Group className="mb-3" controlId="formBasicCheckbox">
                      <Form.Check type="checkbox" label="Match R1"  onChange={e => this.handleHornMatchR1(e)} defaultChecked = {this.state.hornMatchR1}/>
                    </Form.Group>
                  </div>
                  <div className = "col-6">
                    <Form.Group className="mb-3" controlId="formBasicCheckbox">
                      <Form.Check type="checkbox" label="Match R2"  onChange={e => this.handleHornMatchR2(e)} defaultChecked = {this.state.hornMatchR2}/>
                    </Form.Group>
                  </div>
                </div>
                <Form.Group controlId="exampleForm.SelectCustom">
                  <Form.Label>Back </Form.Label>
                  <Form.Control as="select" custom onChange={handleBack}>
                    <option value >Any</option>
                    <option value="back-anemone">anemone </option>
                    <option value="back-balloon">balloon </option>
                    <option value="back-bidens">bidens </option>
                    <option value="back-blue-moon">blue-moon </option>
                    <option value="back-bone-sail">bone-sail </option>
                    <option value="back-buzz-buzz">buzz-buzz </option>
                    <option value="back-candy-canes">andy-canes </option>
                    <option value="back-croc">croc </option>
                    <option value="back-crystal-hermit">crystal-hermit </option>
                    <option value="back-cupid">cupid </option>
                    <option value="back-furball"> furball</option>
                    <option value="back-garish-worm">garish-worm </option>
                    <option value="back-goldfish">goldfish </option>
                    <option value="back-green-thorns"> green-thorns</option>
                    <option value="back-hamaya">hamaya </option>
                    <option value="back-hasagi">hasagi </option>
                    <option value="back-hermit">hermit </option>
                    <option value="back-hero"> hero</option>
                    <option value="back-1nd14n-5t4r">1nd14n-5t4r </option>
                    <option value="back-indian-star">indian-star </option>
                    <option value="back-jaguar">jaguar </option>
                    <option value="back-kingfisher">kingfisher </option>
                    <option value="back-mint">mint </option>
                    <option value="back-origami">origami </option>
                    <option value="back-perch">perch </option>
                    <option value="back-pigeon-post"> pigeon-post</option>
                    <option value="back-pink-turnip">pink-turnip </option>
                    <option value="back-pumpkin">pumpkin </option>
                    <option value="back-raven"> raven</option>
                    <option value="back-red-ear">red-ear </option>
                    <option value="back-risky-beast">risky-beas </option>
                    <option value="back-ronin">ronin </option>
                    <option value="back-rugged-sail">rugged-sail </option>
                    <option value="back-sandal">sandal </option>
                    <option value="back-scarab">scarab </option>
                    <option value="back-shiitake">shiitake </option>
                    <option value="back-shoal-star">shoal-star </option>
                    <option value="back-snail-shell">snail-shell </option>
                    <option value="back-spiky-wing"> spiky-wing</option>
                    <option value="back-sponge">sponge </option>
                    <option value="back-starry-balloon">starry-balloon </option>
                    <option value="back-starry-shell">starry-shell </option>
                    <option value="back-timber">timber </option>
                    <option value="back-tri-feather">tri-feather </option>
                    <option value="back-tri-spikes"> tri-spikes</option>
                    <option value="back-turnip">turnip </option>
                    <option value="back-watering-can"> watering-can</option>
                    <option value="back-yakitori">yakitori </option>
                  </Form.Control>
                </Form.Group>

                
                <div className = "row">
                  <div className = "col-6">
                    <Form.Group className="mb-3" controlId="formBasicCheckbox">
                      <Form.Check type="checkbox" label="Match R1"  onChange={e => this.handleBackMatchR1(e)} defaultChecked = {this.state.backMatchR1}/>
                    </Form.Group>
                  </div>
                  <div className = "col-6">
                    <Form.Group className="mb-3" controlId="formBasicCheckbox">
                      <Form.Check type="checkbox" label="Match R2"  onChange={e => this.handleBackMatchR2(e)} defaultChecked = {this.state.backMatchR2}/>
                    </Form.Group>
                  </div>
                </div>

                <Form.Group controlId="exampleForm.SelectCustom">
                  <Form.Label>Mouth </Form.Label>
                  <Form.Control as="select" custom onChange={handleMouth}>
                    <option value >Any</option>
                    <option value="mouth-axie-kiss">axie-kiss </option>
                    <option value="mouth-catfish">catfish </option>
                    <option value="mouth-confident">confident </option>
                    <option value="mouth-cute-bunny">cute-bunny </option>
                    <option value="mouth-dango">dango </option>
                    <option value="mouth-doubletalk">doubletalk </option>
                    <option value="mouth-feasting-mosquito">feasting-mosquito </option>
                    <option value="mouth-geisha">geisha </option>
                    <option value="mouth-goda">goda </option>
                    <option value="mouth-herbivore">herbivore </option>
                    <option value="mouth-humorless"> humorless</option>
                    <option value="mouth-hungry-bird">hungry-bird </option>
                    <option value="mouth-kawaii">kawaii </option>
                    <option value="mouth-kotaro">kotaro </option>
                    <option value="mouth-lam">lam </option>
                    <option value="mouth-lam-handsome">lam-handsome </option>
                    <option value="mouth-little-owl">little-ow </option>
                    <option value="mouth-mosquito"> mosquito</option>
                    <option value="mouth-mr-doubletalk">mr-doubletalk </option>
                    <option value="mouth-nut-cracker">nut-cracker </option>
                    <option value="mouth-peace-maker">peace-maker </option>
                    <option value="mouth-pincer">pincer </option>
                    <option value="mouth-piranha">piranha </option>
                    <option value="mouth-razor-bite">razor-bite </option>
                    <option value="mouth-risky-fish">risky-fish </option>
                    <option value="mouth-rudolph">rudolph </option>
                    <option value="mouth-serious">serious </option>
                    <option value="mouth-silence-whisper">silence-whisper </option>
                    <option value="mouth-skull-cracker">skull-cracker </option>
                    <option value="mouth-square-teeth">square-teeth </option>
                    <option value="mouth-tiny-turtle">tiny-turtle </option>
                    <option value="mouth-toothless-bite">toothless-bite </option>
                    <option value="mouth-venom-bite">venom-bite </option>
                    <option value="mouth-zigzag">zigzag </option>
                  </Form.Control>
                </Form.Group>


                <div className = "row">
                  <div className = "col-6">
                    <Form.Group className="mb-3" controlId="formBasicCheckbox">
                      <Form.Check type="checkbox" label="Match R1"  onChange={e => this.handleMouthMatchR1(e)} defaultChecked = {this.state.mouthMatchR1}/>
                    </Form.Group>
                  </div>
                  <div className = "col-6">
                    <Form.Group className="mb-3" controlId="formBasicCheckbox">
                      <Form.Check type="checkbox" label="Match R2"  onChange={e => this.handleMouthMatchR2(e)} defaultChecked = {this.state.mouthMatchR2}/>
                    </Form.Group>
                  </div>
                </div>

                <Form.Group controlId="exampleForm.SelectCustom">
                  <Form.Label>Tail </Form.Label>
                  <Form.Control as="select" custom onChange={handleTail}>
                    <option value >Any</option>
                    <option value="tail-ant">ant</option>
                    <option value="tail-carrot">carrot</option>
                    <option value="tail-cattail">cattail</option>
                    <option value="tail-cloud">cloud</option>
                    <option value="tail-cottontail">cottontail</option>
                    <option value="tail-december-surprise">december-surprise</option>
                    <option value="tail-escaped-gecko">escaped-gecko</option>
                    <option value="tail-feather-fan">feather-fan</option>
                    <option value="tail-fire-ant">fire-ant</option>
                    <option value="tail-fish-snack">fish-snack</option>
                    <option value="tail-gerbil">gerbil</option>
                    <option value="tail-gila">gila</option>
                    <option value="tail-granmas-fan">granmas-fan</option>
                    <option value="tail-grass-snake">grass-snake</option>
                    <option value="tail-gravel-ant">gravel-ant</option>
                    <option value="tail-hare">hare</option>
                    <option value="tail-hatsune">hatsune</option>
                    <option value="tail-hot-butt">hot-butt</option>
                    <option value="tail-iguana">iguana</option>
                    <option value="tail-koi">koi</option>
                    <option value="tail-koinobori">koinobori</option>
                    <option value="tail-kuro-koi">kuro-koi</option>
                    <option value="tail-maki">maki</option>
                    <option value="tail-namek-carrot">namek-carrot</option>
                    <option value="tail-navaga">navaga</option>
                    <option value="tail-nimo">nimo</option>
                    <option value="tail-nut-cracker">nut-cracker</option>
                    <option value="tail-omatsuri">omatsuri</option>
                    <option value="tail-post-fight">post-fight</option>
                    <option value="tail-potato-leaf">potato-leaf</option>
                    <option value="tail-pupae">pupae</option>
                    <option value="tail-ranchu">ranchu</option>
                    <option value="tail-rice">rice</option>
                    <option value="tail-sakura-cottontail">sakura-cottontail</option>
                    <option value="tail-shiba">shiba</option>
                    <option value="tail-shrimp">shrimp</option>
                    <option value="tail-snake-jar">snake-jar</option>
                    <option value="tail-snowy-swallow">snowy-swallow</option>
                    <option value="tail-swallow">swallow</option>
                    <option value="tail-tadpole">tadpole</option>
                    <option value="tail-the-last-one">the-last-one</option>
                    <option value="tail-thorny-caterpillar">thorny-caterpillar</option>
                    <option value="tail-tiny-dino">tiny-dino</option>
                    <option value="tail-twin-tail">twin-tail</option>
                    <option value="tail-wall-gecko">wall-gecko</option>
                    <option value="tail-yam">yam</option>
                  </Form.Control>
                </Form.Group>

                <div className = "row">
                  <div className = "col-6">
                    <Form.Group className="mb-3" controlId="formBasicCheckbox">
                      <Form.Check type="checkbox" label="Match R1"  onChange={e => this.handleTailMatchR1(e)} defaultChecked = {this.state.tailMatchR1}/>
                    </Form.Group>
                  </div>
                  <div className = "col-6">
                    <Form.Group className="mb-3" controlId="formBasicCheckbox">
                      <Form.Check type="checkbox" label="Match R2"  onChange={e => this.handleTailMatchR2(e)} defaultChecked = {this.state.tailMatchR2}/>
                    </Form.Group>
                  </div>
                </div>

                <h5> States</h5><hr/>
                <h6> HP</h6>
                  <div className = "row">
                    <div className = "col-1"></div>
                    <div className = "col-4">
                      <FormControl id="basic-url" aria-describedby="basic-addon3"   defaultValue = {this.state.hpStart} onChange= {handleHpStart}/>
                    </div>
                    <div className = "col-2"></div>
                    <div className = "col-4">
                      <FormControl id="basic-url" aria-describedby="basic-addon3"   defaultValue = {this.state.hpEnd} onChange= {handleHpEnd}/> 
                    </div>
                    <div className = "col-1"></div>
                  </div><br/>
                <h6> Speed</h6>
                  <div className = "row">
                    <div className = "col-1"></div>
                    <div className = "col-4">
                      <FormControl id="basic-url" aria-describedby="basic-addon3"   defaultValue = {this.state.speedStart} onChange= {handleSpeedStart}/>
                    </div>
                    <div className = "col-2"></div>
                    <div className = "col-4">
                      <FormControl id="basic-url" aria-describedby="basic-addon3"   defaultValue = {this.state.speedEnd} onChange= {handleSpeedEnd}/> 
                    </div>
                    <div className = "col-1"></div>
                  </div><br/>
                <h6> Skill</h6>
                  <div className = "row">
                    <div className = "col-1"></div>
                    <div className = "col-4">
                      <FormControl id="basic-url" aria-describedby="basic-addon3"   defaultValue = {this.state.skillStart} onChange= {handleSkillStart}/>
                    </div>
                    <div className = "col-2"></div>
                    <div className = "col-4">
                      <FormControl id="basic-url" aria-describedby="basic-addon3"   defaultValue = {this.state.skillEnd} onChange= {handleSkillEnd}/> 
                    </div>
                    <div className = "col-1"></div>
                  </div><br/>
                <h6> Morale</h6>
                  <div className = "row">
                    <div className = "col-1"></div>
                    <div className = "col-4">
                      <FormControl id="basic-url" aria-describedby="basic-addon3"   defaultValue = {this.state.moraleStart} onChange= {handleMoraleStart}/>
                    </div>
                    <div className = "col-2"></div>
                    <div className = "col-4">
                      <FormControl id="basic-url" aria-describedby="basic-addon3"   defaultValue = {this.state.moraleEnd} onChange= {handleMoraleEnd}/> 
                    </div>
                    <div className = "col-1"></div>
                  </div><br/>


                <h5> Breed Count</h5><hr/>
                  <div className = "row">
                    <div className = "col-1"></div>
                    <div className = "col-4">
                      <FormControl id="basic-url" aria-describedby="basic-addon3"   defaultValue = {this.state.breedStart} onChange= {handleBreedStart}/>
                    </div>
                    <div className = "col-2"></div>
                    <div className = "col-4">
                      <FormControl id="basic-url" aria-describedby="basic-addon3"   defaultValue = {this.state.breedEnd} onChange= {handleBreedEnd}/> 
                    </div>
                    <div className = "col-1"></div>
                  </div><br/>

                <h5> pureness</h5><hr/>
                <div className = "row">
                    <div className = "col-1"></div>
                    <div className = "col-4">
                      <FormControl id="basic-url" aria-describedby="basic-addon3"   defaultValue = {this.state.purenessStart} onChange= {handlepurenessStart}/>
                    </div>
                    <div className = "col-2"></div>
                    <div className = "col-4">
                      <FormControl id="basic-url" aria-describedby="basic-addon3"   defaultValue = {this.state.purenessEnd} onChange= {handlepurenessEnd}/> 
                    </div>
                    <div className = "col-1"></div>
                  </div><br/><br/>
              </Card.Body>
            </Card>
          </div>

          <div className = "col-10">

            
            <Card  bg="light">
              <Card.Body>
                <Card.Title><h2>  &nbsp; Wallet Address </h2> <hr/></Card.Title><br/>
                  <div className = "row">
                    <div className = "col-4">
                    <InputGroup className="mb-3">
                      <InputGroup.Text id="basic-addon3">
                        &nbsp;&nbsp;&nbsp;Wallet Address
                      </InputGroup.Text>
                      <FormControl id="basic-url" aria-describedby="basic-addon3"   defaultValue = {this.state.walletAddress} onChange= {handleWalletAddress}/> 
                      </InputGroup>
                    </div>

                    <div className = "col-4">
                      <InputGroup className="mb-3">
                        <InputGroup.Text id="basic-addon3">
                          &nbsp;&nbsp;&nbsp;Private Key
                        </InputGroup.Text>
                        <FormControl id="basic-url" aria-describedby="basic-addon3"   defaultValue = {this.state.privateKey} onChange= {handlePrivateKey}/> 
                      </InputGroup>
                    </div>

                    <div className = "col-4">
                      <Button variant={this.state.isBotRuning? "danger" : "success"} style = {{width : '100%'}} onClick = {this.state.isBotRuning? () => this.stop(): ()=>this.start()}> {this.state.isBotRuning?"Stop Bot ":"Run Bot"} &nbsp;&nbsp;<RingLoader color = {'#ffffff'} loading={this.state.isBotRuning? true : false}  size={25} /></Button>
                    </div>
                  </div>
              </Card.Body>
            </Card><br/>


            <Card  bg="light" style={{height : "30%"}} >
              <Card.Body>
              <Card.Title>
                <div className = "row">
                  <div className = "col-10"> <h2>  &nbsp; Axie List </h2> </div>
                  <div className = "col-2"> <Button variant= "success" style = {{width : '100%'}} onClick = {()=>this.addCriteria()}> Add filter </Button></div>
                </div>
                 <hr/></Card.Title><br/>
                <MDBDataTableV5 hover entriesOptions={[5,7,10,20,50,100,200,500,1000]} entries={5} pagesAmount={100} data={creteriaTableData}  materialSearch />
              </Card.Body>
            </Card><br/>


            <Card  bg="light"  style={{height : "57%"}}>
              <Card.Body>
                <Card.Title><h2>  &nbsp; SCANNING MONITOR </h2> <hr/></Card.Title><br/>
                <MDBDataTableV5 hover entriesOptions={[5,7,10,20,50,100,200,500,1000]} entries={5} pagesAmount={100} data={tableData}  materialSearch />
              </Card.Body>
            </Card>
          </div>
        </div>
      </div>
    );
  }
}

export default App;