var knab = angular.module('knabApp', ['ui.bootstrap'])

function LoginController($scope, $rootScope, $http) {
  $scope.formData = {
    "username": "",
    "password": ""
  }
  $scope.errors = []
  $scope.submit = function () {
    $scope.errors = []
    $http({
      method: 'POST',
      url: '/users/login',
      data: JSON.stringify($scope.formData),
      headers: {'Content-Type': 'application/json'}
    }).success(function (res, status, headers, config) {
      if (res['code'] == 1) {
        $scope.valid_auth = true
        $rootScope.$emit('authenticated', res['data'][0].user)
      } else {
        for (var i = 0; i < res.data.length; i++) {
          $scope.errors.push(res.data[i])
        }
      }
    })
  }
}
knab.controller('LoginController', LoginController);

function RegisterController($scope, $rootScope, $http) {
  $scope.formData = {
    "fullname": "",
    "username": "",
    "password": "",
    "passconf": ""
  }
  $scope.errors = []
  $scope.submit = function () {
    $scope.errors = []
    var request = {
      method: 'POST',
      url: '/users/create',
      data: JSON.stringify($scope.formData),
      headers: {'Content-Type': 'application/json'}
    }
    $http(request).success($scope.onSuccess).error($scope.onError)
  }
  $scope.onSuccess = function (res, status, headers, config) {
    if(res.code === 1) {
      $rootScope.$emit('authenticated', res.data[0].user)
    } else {
      for (var i = 0; i < res.data.length; i++) {
        $scope.errors.push(res.data[i])
      }
    }
  }
  $scope.onError = function (data, status, headers, config) {

  }
}
knab.controller('RegisterController', RegisterController)

function AuthController($scope, $rootScope) {
  $scope.authenticated = false
  $rootScope.$on('authenticated', function () {
    $scope.authenticated = true
  })
}
knab.controller('AuthController', AuthController)


function AccountController($scope, $rootScope, $http) {
  $scope.accounts = []
  $scope.errors = []
  $scope.formData = {
    'type': '',
    'account_uuid': '',
    'desc': '',
    'amount': 0.0,
    'src_account_uuid': ''
  }
  function onAuth(event, user) {
    $scope.authenticated = true
    $scope.welcomeMsg = "Welcome, " + user.fullname +"."
    loadAccounts()
  }
  function loadAccounts() {
    $http.get('/users/accounts').then(function (res, status, headers, config) {
      var result = res.data
      var accounts = []
      for(var i = 0; i < result['data'].length; i++) {
        var account = result['data'][i]
        var transactions = []
        for (var t = 0; t < account.Transactions.length; t++) {
          var transaction = account.Transactions[t]
          transaction['createdAt'] = new Date(transaction['createdAt'])
          switch (transaction['type'].toLowerCase()) {
            case "deposit":
              transaction['class'] = 'success'
              break;
            case "withdraw":
              transaction['class'] = 'danger'
              break;
            case "transfer":
              transaction['class'] = 'info'
              break;
          }
          transactions.push(transaction)
        }
        account['Transactions'] = transactions
        accounts.push(account)
      }
      $scope.accounts = accounts
      // console.log($scope.accounts)
      $scope.loaded_acc = true
    })
  }  
  if (typeof window.auth_user !== "undefined") {
    onAuth('authenticated', window.auth_user)
  } else {
    $scope.authenticated = false
  }
  $scope.deposit = function () {
    $scope.formData.type = 'Deposit'
  } 
  $scope.withdraw = function () {
    $scope.formData.type = 'Withdraw'
  }
  $scope.transfer = function () {
    $scope.formData.type = 'Transfer'
  }
  $scope.submit = function () {
    $scope.errors = []
    var request = {
      method: 'POST',
      url: '/actions/'+$scope.formData['type'].toLowerCase(),
      data: JSON.stringify($scope.formData),
      headers: {'Content-Type': 'application/json'}
    }
    $http(request).then(function (response, status, headers, config) {
      var result = response.data
      if(result.code === 1) {
        $scope.close()
        loadAccounts()
      } else {
        for (var i = 0; i < result.data.length; i++) {
          $scope.errors.push(result.data[i])
        }
      }
    })
  }
  $scope.close = function () {
    for(var key in $scope.formData) {
      $scope.formData[key] = ''
    }
  }
  $scope.logout = function () {
    $http.get('/users/logout').success(function () {
      window.location.reload()
    })
  }

  $rootScope.$on('authenticated', onAuth)
}
knab.controller('AccountController', AccountController)

