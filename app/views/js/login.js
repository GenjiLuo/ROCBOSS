define(function(require, exports, module) {
    var $ = require("jquery");
    var vue = require("vue");
    var laypage = require("laypage");
    var layer = require("layer");
    layer.config({
        path: '/app/views/js/vendor/layer/'
    });
    // 登录
    exports.login = function (captcha) {
        $(document).ready(function () {
            if (captcha.isOpen) {
                if (captcha.success) {
                    window.geetestObj = new window.Geetest({
                        gt : captcha.geetest,
                        challenge : captcha.challenge
                    });
                    geetestObj.appendTo("#geetest-captcha");
                } else {
                    $("#geetest-captcha").html('极验行为验证服务未能启动...');
                    $("#login-btn").hide();
                }
            }

            $("#login-btn").on('click', function(event) {
                login(captcha.isOpen);
            });
        })
    }
    // 注册
    exports.register = function (captcha) {
        $(document).ready(function () {
            if (captcha.isOpen) {
                if (captcha.success) {
                    window.geetestObj = new window.Geetest({
                        gt : captcha.geetest,
                        challenge : captcha.challenge
                    });
                    geetestObj.appendTo("#geetest-captcha");
                } else {
                    $("#geetest-captcha").html('极验行为验证服务未能启动...');
                    $("#register-btn").hide();
                }
            }
            $("#register-btn").on('click', function(event) {
                register(captcha.isOpen);
            });
        });
    }
    // Oauth加入
    exports.o_join = function (url) {
        $(document).ready(function () {
            var objDom = "#new-join";
            $(".join-type").on('click', function(event) {
                var joinType = $(this).data('joinType');
                if (joinType == 'new') {
                    $("#bind-join").hide('fast');
                    $("#new-join").show('fast');
                    $(this).parent().find('.join-type[data-join-type=bind]').removeClass('fc-state-active');
                    $(this).addClass('fc-state-active');
                    objDom = "#new-join";
                } else {
                    $("#bind-join").show('fast');
                    $("#new-join").hide('fast');
                    $(this).parent().find('.join-type[data-join-type=new]').removeClass('fc-state-active');
                    $(this).addClass('fc-state-active');
                    objDom = "#bind-join";
                }
            });
            $(".join-btn").on('click', function(event) {
                toJoin(objDom, url);
            });
        });
    }

    function login(isOpen) {
        if (isOpen == 1) {
            captcha = geetestObj.getValidate();

            if (captcha === false) {
                layer.msg('请正确完成滑动验证码', {icon: 2});
                geetestObj.refresh();
                exit;
            }
        } else {
            captcha = {};
        }
        result = JSON.stringify(captcha);
        var account = $.trim($("#account").val());
        var password = $.trim($("#password").val());

        if (account == '' || password == '') {
            layer.msg('请填写账户和密码', {icon: 2});
            return false;
        }

        $("#login-btn").attr('disabled', 'disabled');
        $("#login-btn").html('<i class="fa fa-spinner fa-spin"></i> 提交中 ...');
        $.post('/login', {
            captcha: result,
            account: account,
            password: password
        }, function(data, textStatus, xhr) {
            layer.msg(data.data, {icon: (data.status == 'success' ? 1 : 2)});
            if (data.status == 'success') {
                setTimeout(function () {
                    window.location.href = '/';
                }, 500);
            } else {
                if (isOpen == 1) {
                    geetestObj.refresh();
                }
                $("#login-btn").removeAttr('disabled');
                $("#login-btn").html('登 录');
            }
        }, 'json');
    }

    function register(isOpen) {
        if (isOpen == 1) {
            captcha = geetestObj.getValidate();

            if (captcha === false) {
                layer.msg('请正确完成滑动验证码', {icon: 2});
                geetestObj.refresh();
                exit;
            }
        } else {
            captcha = {};
        }

        result = JSON.stringify(captcha);
        var username = $('input[name=username]').val();
        var email = $('input[name=email]').val();
        var password = $('input[name=password]').val();
        var repassword = $('input[name=repassword]').val();
        if (username == '' || email == '' || password == '' || repassword == '') {
            layer.msg('所有项都不允许为空', {icon: 2});
            return false;
        }
        if (password.length<8) {
            layer.msg('密码长度不能少于八位', {icon: 2});
            $('input[name=password]').focus();
            return false;
        }

        if (password !== repassword) {
            layer.msg('两次密码不一致', {icon: 2});
            $('input[name=password]').focus();
            return false;
        }

        var o = $("#register-btn").html();
        $("#register-btn").attr('disabled', 'disabled');
        $("#register-btn").html('<i class="fa fa-spinner fa-pulse"></i> 请求中...');
        setTimeout(function (){
            $.post('/register', {
                captcha: result,
                username : username,
                email : email,
                password : password,
            }, function(data) {
                if (data.code == 10100) {
                    geetestObj.refresh();
                }
                if (data.code == 10401 || data.code == 10404) {
                    geetestObj.refresh();
                    $('input[name=email]').focus();
                }
                if (data.code == 10402 || data.code == 10405) {
                    geetestObj.refresh();
                    $('input[name=username]').focus();
                }
                if (data.code == 10403) {
                    geetestObj.refresh();
                    $('input[name=password]').focus();
                }

                $("#register-btn").removeAttr('disabled');
                $("#register-btn").html(o);
                if (data.code == 10000) {
                    layer.msg(data.msg, {icon: 1});
                    setTimeout(function() {
                        window.location.href = '/login';
                    }, 800);
                } else {
                    if (isOpen == 1) {
                        geetestObj.refresh();
                    }
                    layer.msg(data.msg, {icon: 2});
                }
            }, 'json');
        }, 500);
    }

    function toJoin(objDom, url)
    {
        var o = $(".join-btn").html();
        var newAccount = $(objDom+' input[name=newAccount]').val();
        var username = $(objDom+' input[name=username]').val();
        var avatar = $(objDom+' input[name=avatar]').val();
        var email = $(objDom+' input[name=email]').val();
        var password = $(objDom+' input[name=password]').val();

        if (newAccount == 1 && (username == '' || email == '' || password == '')) {
            layer.msg('所有项都不允许为空', {icon: 2});
            return false;
        }

        if (newAccount == 1 && password.length<8) {
            layer.msg('密码长度不能少于八位', {icon: 2});
            $('input[name=password]').focus();
            return false;
        }

        if (newAccount == 0 && (username == ''|| password == '')) {
            layer.msg('用户名、密码不能为空', {icon: 2});
            return false;
        }

        $(".join-btn").attr('disabled', 'disabled');
        $(".join-btn").html('<i class="fa fa-spinner fa-pulse"></i> 请求中...');
        $.post(url, {
            newAccount: newAccount,
            username : username,
            avatar : avatar,
            email: email,
            password: password
        }, function(data) {
            if (data.code == 10000) {
                layer.msg(data.msg, {icon: 1});
                setTimeout(function () {
                    window.location.href="/";
                });
            } else {
                layer.msg(data.msg, {icon: 2});
            }
            $(".join-btn").removeAttr('disabled');
            $(".join-btn").html(o);
        }, 'json');
    }
});
