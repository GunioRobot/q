$(document).ready(function(){

    var QK = new QKinderHook();

    $('#i-own-this a').live('click', function(){
        QK.manage_ownership(this);
    });

    $('.thread-reply-btn').live('click', function(){
        console.debug('here')
        QK.reply_to_comment(this);
        return false;
    });

});


var QKinderHook = function(){ this.init.apply(this, arguments); }
    QKinderHook.prototype = {
        init : function() {},
        last_comment_form : 0,
        reply_to_comment : function(obj)
        {
            var self = this;
            if(self.last_comment_form) {
                $(self.last_comment_form).slideUp();
            }

            var comment_id = obj.id.split('_')[1]
            var append_container = $('#reply-'+comment_id);

            if (append_container.html()=='')
            {
                var form_clone = $('#form_withparent').find('form').clone();
                var l = form_clone.find('input[name=next]').val();

                form_clone.find('input[name=next]').val(l+'#c'+comment_id)
                form_clone.find('input[name=parent]').val(comment_id);

                append_container.append(form_clone);
                append_container.toggle();
            }

            if(append_container.is(':hidden')) {
                append_container.slideDown();
            } else{
               append_container.slideUp();
            }

            self.last_comment_form = '#reply-'+comment_id;

        },
        manage_ownership : function(obj)
        {
            var book_id = obj.id.split('_')[1];

            var send_data = {'book_id':book_id}
            $.getJSON('/books/api/i_own_this_book/', send_data, function(data){
               html_out = "";
                console.debug(data)
               if(data['ownership'])
               {
                   //qr.
                   html_out += '<h2 class="section-title">My QR Code</h2>';
                   html_out += '<div class="qr-code"><p><a href="/books/checkout/'+data['ownership']['key']+'">';
                   html_out += '<img src="'+data['ownership']['qr_code']+'" />';
                   html_out += '</a></p></div>';
                   html_out += '<div id="i-own-this" style="text-align: right; padding: 7px">';
                   html_out += '<small><a href="#" id="book_'+book_id+'">. . . I don\'t own this.</a></small>';
                   html_out += '</div>';

                   //add owners

                } else {
                    html_out += '<div id="i-own-this-box">';
                    html_out += '<p id="i-own-this"><a href="#" id="book_'+book_id+'">i own this</a></p>';
                    html_out += '</div>';

                    $('#owner_'+data['remove_ownership']['id']).fadeOut();
                }

               $('#i-own-this-box').fadeOut(function(){
                   $('#i-own-this-box').html(html_out);
                   $('#i-own-this-box').fadeIn();
               });

            });
            return false;

        }
    }