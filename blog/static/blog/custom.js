
String.prototype.format = function(){
        var str = this;
        for (var i = 0; i < arguments.length; i++) {
            var str = str.replace(new RegExp('\\{' + i + '\\}', 'g'), arguments[i])
        };
        return str;
    }

    $("#comment_form").submit(function(){
        // 判断是否为空
        $("#comment_error").text('');
        if(CKEDITOR.instances["id_text"].document.getBody().getText().trim()==''){
            $("#comment_error").text('评论内容不能为空');
            return false;
        }

        // 更新数据到textarea
        CKEDITOR.instances['id_text'].updateElement();

        // 异步提交
        $.ajax({
            url: "{% url 'update_comment' %}",
            type: 'POST',
            data: $(this).serialize(),
            cache: false,
            success: function(data){
                console.log(data);
                if(data['status']=="SUCCESS"){
                    if($('#reply_comment_id').val()=='0'){
                        // 插入评论
                        var comment_html = '<div id="root_{0}" class="comment">' +
                            '<span>{1}</span>' +
                            '<span>({2})：</span>' +
                            '<div id="comment_{0}">{3}</div>' +
                            '<div class="like" onclick="likeChange(this, \'{4}\', {0})">' +
                                '<span class="glyphicon glyphicon-thumbs-up"></span> ' +
                                '<span class="liked-num">0</span>' +
                            '</div>' +
                            '<a href="javascript:reply({0});">回复</a>' +
                            '</div>';
                        comment_html = comment_html.format(data['pk'], data['username'],data['comment_time'], data['text'], data['content_type']);
                        $("#comment_list").prepend(comment_html);
                    }else{
                        // 插入回复
                        var reply_html = '<div class="reply">' +
                                    '<span>{1}</span>' +
                                    '<span>({2})</span>' +
                                    '<span>回复</span>' +
                                    '<span>{3}：</span>' +
                                    '<div id="comment_{0}">{4}</div>' +
                                    '<div class="like" onclick="likeChange(this, \'{5}\', {0})">' +
                                        '<span class="glyphicon glyphicon-thumbs-up\"></span> ' +
                                        '<span class="liked-num">0</span>' +
                                    '</div>' +
                                    '<a href="javascript:reply({0});">回复</a>' +
                                '</div>';
                        reply_html = reply_html.format(data['pk'], data['username'], data['comment_time'], data['reply_to'], data['text'], data['content_type']);
                        $("#root_" + data['root_pk']).append(reply_html);
                    }

                    // 清空编辑框的内容
                    CKEDITOR.instances['id_text'].setData('');
                    $('#reply_content_container').hide();
                    $('#reply_comment_id').val('0');
                    $('#no_comment').remove();
                    $("#comment_error").text('评论成功');
                }else{
                    // 显示错误信息
                    $("#comment_error").text(data['message']);
                }
            },
            error: function(xhr){
                console.log(xhr);
            }
        });
        return false;
    });
    function reply(reply_comment_id){
        // 设置值
        $('#reply_comment_id').val(reply_comment_id);
        var html = $("#comment_" + reply_comment_id).html();
        $('#reply_content').html(html);
        $('#reply_content_container').show();

        $('html').animate({scrollTop: $('#comment_form').offset().top - 60}, 300, function(){
            CKEDITOR.instances['id_text'].focus();
        });
    };
    function likeChange(obj, content_type, object_id){
        var is_like = obj.getElementsByClassName('active').length==0
        $.ajax({
            url: "{% url 'like_change' %}",
            type: 'GET',
            data: {
                content_type: content_type,
                object_id: object_id,
                is_like: is_like
            },
            cache: false,
            success: function(data){
                console.log(data)
                if(data['status']=='SUCCESS'){
                    // 更新点赞状态
                    var element = $(obj.getElementsByClassName('glyphicon'));
                    if ( is_like){
                        element.addClass('active');
                    }else{
                        element.removeClass('active');
                    }
                    // 更新点赞数量
                    var liked_num = $(obj.getElementsByClassName('liked-num'));
                    liked_num.text(data['liked_num']);
                }else{
                    if(data['code']==400){
                        $('#login_modal').modal('show');
                    }else{
                        alert(data['message']);
                    }
                }
            },
            error: function(xhr){
                console.log(xhr)
            }
        });
    }
    $("#login_modal_form").submit(function(event){
        event.preventDefault();
        $.ajax({
            url: '{% url "login_for_modal" %}',
            type: 'POST',
            data: $(this).serialize(),
            cache: false,
            success: function(data){
                if(data['status']=='SUCCESS'){
                    window.location.reload();
                }else{
                    $('#login_modal_tip').text('用户名或密码不正确');
                }
            }
        });
    });
     if (window.location.hash) {
        $('html').animate({
            scrollTop: $(window.location.hash).offset().top - 60
        }, 500);
    }
