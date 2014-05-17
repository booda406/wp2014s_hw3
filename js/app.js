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
        handler.navbar();
        window.location.hash = '';
      });
    },
    login: function(){
      var current_user = Parse.User.current();
      var postAction = function(){
        handler.navbar();
        window.location.hash = (redirect) ? redirect : '';
      }
      if (current_user) {
        window.location.hash = '';
      } else {
        // Signin Function binding, provided by Parse SDK.        
        document.getElementById('content').innerHTML = templates.loginView();
      	// 把版型印到瀏覽器上();

        // 綁定註冊表單的密碼檢查事件(); // 參考上課範例
        document.getElementById('form-signup-password1').addEventListener('keyup', function(){
          var singupForm_password = document.getElementById('form-signup-password');
          var message = (this.value !== singupForm_password.value) ? '密碼不一樣啦，認真點好嗎？' : '';
          document.getElementById('form-signup-message').style.display = 'block';     
          document.getElementById('form-signup-message').innerHTML = message;  
          if(this.value === singupForm_password.value){
             document.getElementById('form-signup-message').style.display = 'none';     
          }
        });
       
        // 綁定登入表單的學號檢查事件(); // 可以利用TAHelp物件  
        document.getElementById('form-signin').addEventListener('submit', function(){
          var student_id = document.getElementById('form-signin-student-id').value;
          if(!TAHelp._isMemberOf(student_id)){
            document.getElementById('form-signin-message').style.display = 'block';     
            document.getElementById('form-signin-message').innerHTML = '你在亂試，我就打爆你。';
          }
        });
        
        // 綁定註冊表單的學號檢查事件(); // 可以利用TAHelp物件
        document.getElementById('form-signup').addEventListener('submit', function(){
          var student_id = document.getElementById('form-signup-student-id').value;
          if(!TAHelp._isMemberOf(student_id)){
            alert('你走錯房間了吧？我們沒你這學生。');
            window.location.hash = '';
          }

        });

        // 綁定登入表單的登入檢查事件(); // 送出還要再檢查一次，這裡會用Parse.User.logIn
        document.getElementById('form-signin').addEventListener('submit', function(){
          Parse.User.logIn(document.getElementById('form-signin-student-id').value,
              document.getElementById('form-signin-password').value, {
            success: function(user) {
              postAction();
            },
            error: function(user, error) {
              document.getElementById('form-signin-message').innerHTML = error.message;
            }
          }); 
        });

        // 綁定註冊表單的註冊檢查事件(); // 送出還要再檢查一次，這裡會用Parse.User.signUp和相關函數
        document.getElementById('form-signup').addEventListener('submit', function(){
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


          // var user = new Parse.User();
          // user.set("username", document.getElementById('form-signup-student-id').value);
          // user.set("password", document.getElementById('form-signup-password').value);
          // user.set("email", document.getElementById('form-signup-email').value);

          // Parse.User.signUp(document.getElementById('form-signup-student-id').value,
          //     document.getElementById('form-signup-password').value, 
          //     document.getElementById('form-signup-email').value, {
          //   success: function(user) {
          //     postAction();
          //   },
          //   error: function(user, error) {
          //     document.getElementById('form-signup-message').style.display = 'block';
          //     document.getElementById('form-signup-message').innerHTML = error.message;
          //   }
          // }); 
        });
       
        }
    },
    evaluation: function(object){
      // t = evaluation n = current_user r = access
          var evaluation = Parse.Object.extend("Evaluation");
          var current_user = Parse.User.current();
          var access = new Parse.ACL;
          access.setPublicReadAccess(false);
          access.setPublicWriteAccess(false);
          access.setReadAccess(current_user, true);
          access.setWriteAccess(current_user, true);
          // i = tmp_evaluation
          var tmp_evaluation = new Parse.Query(evaluation);
          tmp_evaluation.equalTo("user",current_user);
          tmp_evaluation.first({
            success: function(tmp_evaluation){
            window.EVAL = tmp_evaluation;
            if(tmp_evaluation === undefined){
              var s = TAHelp.getMemberlistOf(current_user.get("username")).filter(function(e){
                return e.StudentId !== current_user.get("username") ? true : false
              }).map(function(e){
                e.scores = ["0","0","0","0"];
                return e
              })
            }else{
              var s = tmp_evaluation.toJSON().evaluations
            }
            document.getElementById("content").innerHTML = e.evaluationView(s);
            document.getElementById("evaluationForm-submit").value = tmp_evaluation === undefined ? "送出表單" : "修改表單";
            document.getElementById("evaluationForm").addEventListener("submit",function(){
              for(var o = 0; o < s.length; o++){
                for(var u = 0; u < s[o].scores.length; u++){
                  var a = document.getElementById("stu" + s[o].StudentId + "-q" + u);
                  var f = a.options[a.selectedIndex].value;s[o].scores[u] = f
                }
              }
                if(tmp_evaluation === undefined){
                  tmp_evaluation = new evaluation;
                  tmp_evaluation.set("user",current_user);
                  tmp_evaluation.setACL(r)
                }
                  console.log(s);
                  tmp_evaluation.set("evaluations",s);
                  tmp_evaluation.save(null,{success: function(){
                    document.getElementById("content").innerHTML = e.updateSuccessView();
                  },
                  error: function(){

                  }
                })
                },
                false
                )},
            error: function(e,evaluation){}
          })
      // 基本上和上課範例購物車的函數很相似，這邊會用Parse DB
      // 問看看Parse有沒有這個使用者之前提交過的peer review物件(
      // 沒有的話: 從TAHelp生一個出來(加上scores: [‘0’, ‘0’, ‘0’, ‘0’]屬性存分數並把自己排除掉)
      // 把peer review物件裡的東西透過版型印到瀏覽器上();
      // 綁定表單送出的事件(); // 如果Parse沒有之前提交過的peer review物件，要自己new一個。或更新分數然後儲存。
    },
  };
  var App = Parse.Router.extend({
    routes: {
      '': 'index',
      'login': 'login',
      'peer-evaluation': 'evaluation'
    },
    index: function(){
      if(Parse.User.current()){
        window.location.hash = "evaluation/"
      }else{
        window.location.hash = "login/"
      }
    },
    evaluation: handler.evaluation,
    login: handler.login
  });

  this.Router = new App();
  Parse.history.start();
  handler.navbar();
  // 讓router活起來();
})();
