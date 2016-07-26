/*!
* 	jQuery Sortable Menu
* 	https://github.com/lukesnowden/sortable
* 	Copyright 2014 Luke Snowden
* 	Released under the MIT license:
* 	http://www.opensource.org/licenses/mit-license.php
*/

( function ( $ ) {
	$.fn.sortableMenu = function (opts)
	{
		var opts = $.extend({
			formSelector 	: 'form:eq(0)'
		}, opts),

		app = {

			menu : null,

			tabWidth : 40,

			sortParents : function() {
				$('li:not(.ui-sortable-helper):not(.ghost)', app.menu ).each( function(i){
					var item = $(this);
					var parent_id = null;
					item.prevAll('li:not(.ui-sortable-helper):not(.ghost)').each( function(){
						if( parent_id === null && $(this).data('menuData').tabbed == (item.data('menuData').tabbed-1) ) {
							parent_id = $(this).data('menuData').id;
						}
					});
					parent_id = ( parent_id === null ? 0 : parent_id );
					item.data('menuData').parent = parent_id;
				});
			},

			serializeData : function() {
				var items = [];
				$('li:not(.ui-sortable-helper):not(.ghost)', app.menu ).each( function(i){
					if( typeof $(this).data( 'menuData' ) !== 'undefined' ) {
						items.push( { 'id' : $(this).data( 'menuData' ).id, 'parent_id' : $(this).data( 'menuData' ).parent, 'order' : i } );
					}
				});
				return JSON.stringify( items );
			},

			/**
			 * [getPaceholderIndex description]
			 * @param  {[type]} ui [description]
			 * @return {[type]}    [description]
			 */

			getPaceholderIndex : function() {
				var clone = app.menu.clone();
				$('.ui-sortable-helper', clone).remove();
				return $('.ghost', clone).index();
			},

			/**
			 * [hasChildren description]
			 * @param  {[type]}  item [description]
			 * @return {Boolean}      [description]
			 */

			hasChildren : function( item ) {
				var sibling = item.nextAll(':not(.ui-sortable-helper):not(.ghost)');
				if( sibling.length !== 0 && sibling.data( 'menuData' ).tabbed > item.data( 'menuData' ).tabbed  ) {
					return true;
				}
				return false;
			},

			/**
			 * [isCarryingChildren description]
			 * @param  {[type]}  item [description]
			 * @return {Boolean}      [description]
			 */

			isCarryingChildren : function( item ) {
				if( typeof item.data('menuData').children !== 'undefined' && item.data('menuData').children ) {
					return true;
				}
				return false;
			},

			/**
			 * [attachChildren description]
			 * @param  {[type]} ui [description]
			 * @return {[type]}    [description]
			 */

			attachChildren : function( ui ) {
				var items = [];
				var children = ui.item.nextAll(':not(.ui-sortable-helper):not(.ghost)');
				children.each( function(){
					var child = $(this);
					if( child.data( 'menuData' ).tabbed > ui.item.data( 'menuData' ).tabbed ) {
						var clone = child.clone();
						// Doesn't seem to clone the data...
						clone.data( 'menuData', child.data( 'menuData' ) );
						items.push( clone );
						child.remove();
					}
				});
				ui.item.data( 'menuData' ).children = items;
				app.menu.sortable('refresh');
			},

			/**
			 * [releaseChildren description]
			 * @param  {[type]} item [description]
			 * @return {[type]}      [description]
			 */

			releaseChildren : function( item ) {
				var itemData = item.data( 'menuData' );
				var difference = Math.abs( itemData.prevTabbed - itemData.tabbed );
				for( var i in itemData.children.reverse() ) {
					var child = itemData.children[i];
					var childData = child.data('menuData');
					if( itemData.tabbed < itemData.prevTabbed ) {
						child.data('menuData').tabbed = childData.prevTabbed - difference;
					} else if( itemData.tabbed > itemData.prevTabbed ) {
						child.data('menuData').tabbed = childData.prevTabbed + difference;
					}
					childData.prevTabbed = childData.tabbed;
					child.css({
						left : ( childData.tabbed * app.tabWidth ) + 'px'
					});
					child.insertAfter(item);
				}
				item.data( 'menuData' ).children = false;
				app.menu.sortable('refresh');
			},

			/**
			 * [getClostestParent description]
			 * @param  {[type]} placeholder [description]
			 * @return {[type]}             [description]
			 */

			getClostestParent : function( placeholder ) {
				var clone = app.menu;
				var ghost = $('.ghost', clone);
				return ( typeof ghost.prevAll(':not(.ui-sortable-helper)')[0] !== 'undefined' ? $(ghost.prevAll(':not(.ui-sortable-helper)')[0]) : null );
			},

			/**
			 * [updatePositions description]
			 * @param  {[type]} e  [description]
			 * @param  {[type]} ui [description]
			 * @return {[type]}    [description]
			 */

			updatePositions : function( e, ui ) {
				$('> li:not(.ui-sortable-helper):not(.ghost)', app.menu).each( function(i){
					$(this).data( 'menuData' ).position = i;
				});
			},

			/**
			 * [updateDisplay description]
			 * @param  {[type]} e  [description]
			 * @param  {[type]} ui [description]
			 * @return {[type]}    [description]
			 */

			updateDisplay : function( e, ui ) {
				var closestParent = app.getClostestParent( ui.item );
				if( closestParent === null || ui.placeholder.data( 'menuData' ).tabbed < 0 || ui.placeholder.data( 'menuData' ).position === 0 ) {
					ui.placeholder.data( 'menuData' ).tabbed = 0;
				}
				if( closestParent ) {
					if( ui.placeholder.data( 'menuData' ).tabbed >= (closestParent.data( 'menuData' ).tabbed+1) ) {
						ui.placeholder.data( 'menuData' ).tabbed = (closestParent.data( 'menuData' ).tabbed+1);
					}
					ui.placeholder.data( 'menuData' ).parent = closestParent.data( 'menuData' ).id;
				}
				ui.placeholder.css({
					left : ( ui.placeholder.data( 'menuData' ).tabbed * app.tabWidth ) + 'px'
				});
			},

			/**
			 * [tabChanged description]
			 * @param  {[type]} e  [description]
			 * @param  {[type]} ui [description]
			 * @return {[type]}    [description]
			 */

			tabChanged : function( e, ui ) {
				app.updateDisplay( e, ui );
			},

			/**
			 * [leftPosition description]
			 * @return {[type]} [description]
			 */

			leftPosition : function(){
				var offset = app.menu.offset();
				return offset.left;
			},

			/**
			 * [start description]
			 * @param  {[type]} e  [description]
			 * @param  {[type]} ui [description]
			 * @return {[type]}    [description]
			 */

			start : function( e, ui ) {
				if( e.target.nodeName.toLowerCase() !== 'span' ) {
					// @todo
				}
				app.updatePositions( e, ui );
				var clone = $('> span', ui.item).clone();
				clone.appendTo( ui.placeholder );
				ui.placeholder.data( 'menuData', ui.item.data( 'menuData' ) );
				if( app.hasChildren( ui.item ) ) {
					app.attachChildren( ui );
				}
				app.updateDisplay( e, ui );
			},

			/**
			 * [changed description]
			 * @param  {[type]} e  [description]
			 * @param  {[type]} ui [description]
			 * @return {[type]}    [description]
			 */

			changed : function( e, ui ) {
				ui.placeholder.data( 'menuData' ).position = app.getPaceholderIndex();
				app.updatePositions( e, ui );
				app.updateDisplay( e, ui );
			},

			/**
			 * [sort description]
			 * @param  {[type]} e  [description]
			 * @param  {[type]} ui [description]
			 * @return {[type]}    [description]
			 */

			sort : function( e, ui ) {
				var tabbed = Math.floor( ( ui.position.left - app.leftPosition() ) / app.tabWidth );
				if( tabbed !== ui.placeholder.data( 'menuData' ).tabbed ) {
					ui.placeholder.data( 'menuData' ).tabbed = tabbed;
					app.tabChanged( e, ui );
				}
			},

			/**
			 * [stop description]
			 * @param  {[type]} e  [description]
			 * @param  {[type]} ui [description]
			 * @return {[type]}    [description]
			 */

			stop : function( e, ui ) {
				ui.item.data( 'menuData', ui.placeholder.data( 'menuData' ) );
				app.updatePositions( e, ui );
				if( ui.item.data( 'menuData' ).tabbed < 0 ) {
					ui.item.data( 'menuData' ).tabbed = 0;
				}
				if( app.isCarryingChildren( ui.item ) ) {
					app.releaseChildren( ui.item );
				}
				ui.item.data( 'menuData' ).prevTabbed =  ui.item.data( 'menuData' ).tabbed;
				ui.item.css({
					left : ( ui.item.data( 'menuData' ).tabbed * app.tabWidth ) + 'px'
				});
				app.sortParents();
				app.menu.data('serialize', app.serializeData() );
			},

			/**
			 * [positionItems description]
			 * @return {[type]} [description]
			 */

			positionItems : function() {
				$('> li', app.menu).each( function(i){
					var item = $(this);
					var parameters = JSON.parse( $(this).attr('data-parameters') );
					item.data( 'menuData', {
						id 			: parseInt( parameters[0] ),
						parent 		: parseInt( parameters[1] ),
						prevTabbed  : parseInt( parameters[2] ),
						tabbed 		: parseInt( parameters[2] ),
						position 	: i
					});
					item.css({
						left : ( item.data( 'menuData' ).tabbed * app.tabWidth ) + 'px'
					});
				});
			},

			/**
			 * [init description]
			 * @param  {[type]} elm   [description]
			 * @param  {[type]} index [description]
			 * @return {[type]}       [description]
			 */

			init : function( elm, index ) {
				app.menu = $(elm).sortable({
					items 		: '> li',
					placeholder : 'ghost',
					cancel  	: '.disabled',
					appendTo 	: document.body,
					start		: app.start,
					sort 		: app.sort,
					stop 		: app.stop,
					change 		: app.changed
				});
				app.positionItems();
				app.menu.data('serialize', app.serializeData() )
			}
		}

		return $(this).each( function ( i )
		{
			app.init( this, i );
		});

	}
})( jQuery );

