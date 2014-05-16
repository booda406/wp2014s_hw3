(function(){

 Parse.initialize("yu8RAJTBtAOtCcOVaIBN2yhbuocSLGaj6BjRhXgg", "pTbJPYwltpKGcF3y0qOSwxmCDpCtaQ4bfOKSLKx4");
 // 初始化Parse();

  var templates = {};
  ['loginView', 'evaluationView', 'updateSuccessView'].forEach(function(e){
    var tpl = document.getElementById(e).text;
    templates[e] = doT.template(tpl);
  });
  // 編譯template engine函數();

  // 可選-編寫共用函數();
  
  var handler = {
    navbar: function(){
	  var current_user = Parse.User.current();
      if(current_user){
        document.getElementById('loginButton').style.display = 'none';
        document.getElementById('evaluationButton').style.display = 'block';
        document.getElementById('logoutButton').style.display = 'block';
        // 顯示哪些button();
      } else {
        document.getElementById('loginButton').style.display = 'block';
        document.getElementById('evaluationButton').style.display = 'none';
        document.getElementById('logoutButton').style.display = 'none';   
        // 顯示哪些button();      
      }
      document.getElementById('logoutButton').addEventListener('click', function(){
        Parse.User.logOut();
        handlers.navbar();
        window.location.hash = '';
      });
    },
    login: function(){
      var current_user = Parse.User.current();
      var postAction = function(){
        handlers.navbar();
        window.location.hash = (redirect) ? redirect : '';
      }
      if (current_user) {
        window.location.hash = '';
      } else {
        // Signin Function binding, provided by Parse SDK.        
        document.getElementById('content').innerHTML = templates.loginView();
      	// 把版型印到瀏覽器上();

        // Signup Form Password Match Check Binding.
        document.getElementById('form-signup-password1').addEventListener('keyup', function(){
          var singupForm_password = document.getElementById('form-signup-password');
          var message = (this.value !== singupForm_password.value) ? '密碼不一致，請再確認一次。' : '';
          document.getElementById('form-signup-message').innerHTML = message;           
        });
        // Signup Function binding, provided by Parse SDK.
        document.getElementById('form-signup').addEventListener('submit', function(){
          var singupForm_password = document.getElementById('form-signup-password');
          var singupForm_password1 = document.getElementById('form-signup-password1');
          if(singupForm_password.value !== singupForm_password1.value){
            document.getElementById('form-signup-message').innerHTML = '密碼不一致，請再確認一次。';      
            return false; 
          }
      	});
      	// 綁定註冊表單的密碼檢查事件(); // 參考上課範例
       document.getElementById('form-signin').addEventListener('submit', function(){
          var student_id = document.getElementById('form-signin-student-id');
          if(!_isMemberOf(student_id)){
            document.getElementById('form-signin-message').innerHTML = '不是有效的課程學生。';
          }
        });
        // 綁定登入表單的學號檢查事件(); // 可以利用TAHelp物件
        document.getElementById('form-signup').addEventListener('submit', function(){
          var student_id = document.getElementById('form-signup-student-id');
          if(!TAHelp.isVaildStudentID(student_id)){
            document.getElementById('form-signup-message').innerHTML = '不是有效的Student ID。';
          }

        });
        // 綁定註冊表單的學號檢查事件(); // 可以利用TAHelp物件
        document.getElementById('form-signin').addEventListener('submit', function(){
          Parse.User.logIn(document.getElementById('form-signin-student-id').value,
              document.getElementById('form-signin-password').value, {
            success: function(user) {
              postAction();
            },
            error: function(user, error) {
              document.getElementById('form-signin-message').innerHTML = error.message + '['+error.code+']';
            }
          }); 
        });
        // 綁定登入表單的登入檢查事件(); // 送出還要再檢查一次，這裡會用Parse.User.logIn
        document.getElementById('form-signup').addEventListener('submit', function(){
          Parse.User.signUp(document.getElementById('form-signup-student-id').value,
              document.getElementById('form-signup-password').value, 
              document.getElementById('form-signup-email').value, {
            success: function(user) {
              postAction();
            },
            error: function(user, error) {
              document.getElementById('form-signup-message').innerHTML = error.message + '['+error.code+']';
            }
          }); 
        });
        // 綁定註冊表單的註冊檢查事件(); // 送出還要再檢查一次，這裡會用Parse.User.signUp和相關函數
       
          var user = new Parse.User();
          user.set("username", document.getElementById('form-signup-student-id').value);
          user.set("password", document.getElementById('form-signup-password').value);
          user.set("email", document.getElementById('form-signup-email').value);
 
          user.signUp(null, {
            success: function(user) {
              postAction();
              // Hooray! Let them use the app now.
            },
            error: function(user, error) {
              // Show the error message somewhere and let the user try again.
              document.getElementById('form-signup-message').innerHTML = error.message + '['+error.code+']';
            }
          });
		}
    },
    evaluation: function(object){
      var current_user = Parse.User.current();      
      if (currentUser) {
        var Order = Parse.Object.extend("Order");
        var query = new Parse.Query(Order);
        query.equalTo('user', currentUser);
        // Let the query return results along with relational data.
        query.include('dress');
        query.find({
          success: function(results){
            var objList = results.map(function(e){ 
              return {
                'dressId': e.get('dress').id,
                'amount': e.get('amount'),
                'name': e.get('dress').get('name'),
                'previewUrl': e.get('dress').get('previewUrl'),                
              }
            });
            document.getElementById('content').innerHTML = templates.mycartTemplate(objList);
            results.forEach(function(e){
              var changeAmount = document.getElementById('change_amount_'+e.get('dress').id);
              changeAmount.addEventListener('change', function(){
                var amount = parseInt(this.options[this.selectedIndex].value);
                myCart.setAmountTo(currentUser, e.get('dress'), amount, function(){});
              });
              var cancelOrderBtn = document.getElementById('cancel_order_'+e.get('dress').id);
              cancelOrderBtn.addEventListener('click', function(){
                myCart.setAmountTo(currentUser, e.get('dress'), 0, function(){
                  if (cancelOrderBtn.parentNode.parentNode.childElementCount === 1){
                    handlers.mycart();
                  } else {
                    cancelOrderBtn.parentNode.remove();
                  }
                });
              });
            });
            // Easter Egg!!!
            document.getElementById('payButton').parentNode.addEventListener('click', function(){
              // Toogle Effect
              if( this.childElementCount === 1){
                var YTcode = '<iframe width="960" height="517" ' +
                  'src="https://www.youtube-nocookie.com/embed/NkQc4FXCvtA?autoplay=1&rel=0&iv_load_policy=3"' +
                  ' frameborder="0" allowfullscreen></iframe>';
                this.innerHTML += YTcode;
              } else {
                this.children[1].remove();
              }
              return false
            });
          },
          error: function(error){
          
          },
        });
      } else {
        window.location.hash = 'login/'+ window.location.hash;
      }
      // 基本上和上課範例購物車的函數很相似，這邊會用Parse DB
      // 問看看Parse有沒有這個使用者之前提交過的peer review物件(
      // 沒有的話: 從TAHelp生一個出來(加上scores: [‘0’, ‘0’, ‘0’, ‘0’]屬性存分數並把自己排除掉)
      // 把peer review物件裡的東西透過版型印到瀏覽器上();
      // 綁定表單送出的事件(); // 如果Parse沒有之前提交過的peer review物件，要自己new一個。或更新分數然後儲存。
    },
  };
  var App = Parse.Router.extend({
    routes: {
      '': 'login',
      'login': 'login',
      'peer-evaluation': 'evaluation'
    },
    // If frontpage is requested, show the first page of catalog.
    evaluation: handler.evaluation,
    login: handler.login
  });

  this.Router = new App();
  Parse.history.start();
  handler.navbar();
  // 讓router活起來();
})();
