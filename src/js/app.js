App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',

  init: async function () {
    return App.initWeb3();

  },
  initWeb3: async function () {
    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.request({ method: "eth_requestAccounts" });;
        // await ethereum.enable()
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    await App.loadAccount()

    return App.initContract();
  }

  , loadAccount: async () => {

    web3.eth.getAccounts().then(function (accounts) {
      App.account = accounts[0];
    });
  }

  , initContract: function () {
    $.getJSON("Election.json", function (election) {
      // instantiate a new truffle contract from the artifact
      App.contracts.Election = TruffleContract(election)
      // connect provider to interact with contract
      App.contracts.Election.setProvider(App.web3Provider)
      return App.render()
    })

  },

  render: function () {
    var electionInstance
      , loader = $('#loader'),
      content = $('#content')

    loader.show()
    content.hide()

    // load contract data
    App.contracts.Election.deployed().then(function (instance) {
      electionInstance = instance
      window.address = instance.address
      App.listenForEvents()
      return electionInstance.candidatesCount()
    }).then(function (candidatesCount) {
      var candidatesResults = $('#candidatesResults')
      candidatesResults.empty()

      var candidatesSelect = $('#candidatesSelect');
      candidatesSelect.empty();

      for (let index = 0; index <= candidatesCount; index++) {
        electionInstance.candidates(index).then(function (candidate) {
          var id = candidate[0]
            , name = candidate[1]
            , voteCount = candidate[2]

          if (name) {
            // render candidate result
            var candidateTemplate =
              "<tr><th>" + id + "</th><td>"
              + name + "</td><td>" + voteCount
              + "</td></tr>"

            candidatesResults.append(candidateTemplate)

            // Render candidate ballot option
            var candidateOption = "<option value='" + id + "' >" + name + "</ option>"
            candidatesSelect.append(candidateOption);
          }
        })
      }

      return electionInstance.voters(App.account)

    }).then(function(hasVoted) {
      if (hasVoted) {
        $('form').hide()
      }
      loader.hide()
      content.show()
    }).catch(function (error) {
      console.warn(error)
    })
  },

  castVote: function() {
    var candidateId = document.querySelector("#candidatesSelect").value
    App.contracts.Election.deployed().then(function(instance) {
      return instance.vote(candidateId, {from: App.account})
    }).then(function(result) {
      console.log('cast vote', result)
      $("#content").hide();
      $("#loader").show();
      // if no exception then reload
      App.render()
    }).catch(function(err) {
      console.error(err);
    })
  },

};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
