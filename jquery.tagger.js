/******************************************************************************
  Tagger jQuery Plugin

  This plugin turn an unordered list of tags into a text input that autosuggests
  tags and allows users to add and remove tags from the parent object

  DEPENDENCIES
  * jQuery 1.4.2+
  * jQuery UI 1.8.7+ (Widget Factory + Autocomplete)
  * Autosuggest widget (jquery.autosuggest.js)

  Author: Mina Mikhail (@fightingtheboss)
  Github: http://github.com/fightingtheboss

******************************************************************************/

(function($) {
  $.widget('ui.tagger', {
    options: {
      tagFormArray: 'post[tags][]',
      allowSpaces: true,
      autosuggest: {
        minLength: 2,
        delay: 250
      }
    },

    _keys: {
      BACKSPACE: 8,
      TAB: 9,
      ENTER: 13,
      SPACE: 32,
      COMMA: 44
    },

    _create: function() {
      var self = this,
          staticTags = this.element.children('li');

      // Create the text input element and append to parent
      this.element
        .addClass('tagger')
        .append( $('<li class="tagger-new"><input type="text" class="tagger-input" /></li>') );

      this.input = this.element.find('input[type=text]');

      // Check for existing children and turn them into tags
      if ( staticTags.length > 0 ) {
        staticTags.each( function( index, element ) {
          var value = $(this).text();

          $(this)
            .addClass( 'tagger-tag' )
            .append( $('<a class="close" href="#">x</a>') )
            .append( $('<input />').attr( { type: 'hidden', value: value, name: self.options.tagFormArray } ) );
        });
      }

      // Check for passed in initial tags and create them
      if ( this.options.initialTags ) {
        $.each( this.options.initialTags, function( index, value ) {
          self._createTag( value );
        });
      }

      // Wire-up events
      this.element.click( function( event ) {
        if ( event.target.tagName == 'A' ) {
          // Removes a tag when the little 'x' is clicked.
          // Event is binded to the UL, otherwise a new tag (LI > A) wouldn't have this event attached to it.
          $(event.target).parent().remove();
        }
        else {
          // Sets the focus() to the input field, if the user clicks anywhere inside the UL.
          // This is needed because the input field needs to be of a small size.
          self.input.focus();
        }

        return false;
      });

      this.input.keydown( function(event) {
        if (event.which === self._keys.TAB) {
          self._renderTag( event, self );
        }
      });

      this.input.keypress( function( event ){
        if ( event.which === self._keys.BACKSPACE && self.input.val() === "" ) {
          // When backspace is pressed, the last tag is deleted.
          self.children(".tagger-tag:last").remove();
        }
        else if ( event.which === self._keys.COMMA
                  || event.which === self._keys.ENTER
                  || (event.which === self._keys.SPACE && !self.options.allowSpaces)) {
          // Comma, Enter and Space (if allowSpaces is false) are all valid delimiters for new tags.
          self._renderTag( event, self );
        }
      });

      // Wire-up autosuggest
      if ( $.fn.autosuggest ) {
        this.input
          .autosuggest( this.options.autosuggest )
          .bind( 'autosuggestselect.tagger', function( event, ui ) {
            self._selectTag( ui.item.value );
            return false;
          });
      } else if ( $.fn.autocomplete ) {
        this.input
          .autocomplete( this.options.autosuggest )
          .bind( 'autosuggestselect.tagger', function( event, ui ) {
            self._selectTag( ui.item.value );
            return false;
          });
      }
    },

    _isNewTag: function( value ) {
      var isNew = true;

      this.element.children(".tagger-tag").each( function( index, element ) {
        if (value.toLowerCase() === $(this).find("input").val().toLowerCase()) {
          return isNew = false;
        }
      });

      return isNew;
    },

    _renderTag: function( event, self ) {
      event.preventDefault();
      self.input.autosuggest("disable");

      var typed = $.trim( self.input.val().replace(/,+$/,"") );

      if (typed !== "")
        self._selectTag( typed );
    },

    _selectTag: function( value ) {
      if ( this._isNewTag( value ) ) {
        this._createTag( value );
      }

      this.input.val("");
      this.input.autosuggest("enable");
    },

    _createTag: function( value ) {
      var tag = $('<li class="tagger-tag"></li>')
                  .html( value )
                  .append( $('<a class="close" href="#">x</a>') )
                  .append( $('<input type="hidden" />').attr( { value: value, name: this.options.tagFormArray } ) )
                  .insertBefore( this.input.parent() );

      this.input.val("");
      this.input.autosuggest("close");
    },

    destroy: function() {
      // Need to clean up here: remove all generated elements and events
      this.element.children('.tagger-tag').find('a').remove().end().find('input').remove().end().removeClass('tagger-tag');
      this.input.parent().remove();
      this.element.removeClass('tagger');

      $.Widget.prototype.destroy.apply( this, arguments );
    }
  });
})( jQuery );