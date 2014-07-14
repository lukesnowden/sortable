(function ($) {
	$.extend($.fn,
	{
		sortable : function (opts)
		{
			var opts = $.extend(
			{
				dev : false
			}, opts);

			var init = function (elm, i)
			{
				$sortable = $(elm);

				$sortable.bind( 'serialize', function()
				{
					$( '> li', $(this) ).each( function()
					{
						var 	that = $(this),
							code = $('form:eq(0)'),
							m = that[0].pmmenu,
							ref = that.attr( 'data-reference' ),
							$text = $('<input type="hidden" name="' + ref + '[text]" />'),
							$title = $('<input type="hidden" name="' + ref + '[title]" />'),
							$class = $('<input type="hidden" name="' + ref + '[class]" />'),
							$parent = $('<input type="hidden" name="' + ref + '[parent]" />');

						$text.val( $( '[name="label"]', that ).val() );
						$title.val( $( '[name="title"]', that ).val() );
						$class.val( $( '[name="class"]', that ).val() );

						$( that.prevAll('li').get().reverse()).each( function()
						{
							if( ( $(this)[0].pmmenu.tabs+1 ) === m.tabs )
							{
								$parent.val( $(this).attr( 'data-reference' ) );
								return;
							}
						});

						$text.appendTo( code );
						$title.appendTo( code );
						$class.appendTo( code );
						$parent.appendTo( code );

					});
				});

				$sortable.mousedown( function (e)
				{
					var $target = e.target;
					if ( $target.tagName.toLowerCase() === 'input' )
					{
						$( $target ).parents( 'li:eq(0)' ).addClass( 'disabled' );
						$target.focus();
					}
					else if ( $($target).hasClass( 'expander' ) )
					{
						// Prevent dragging on options expand trigger
						$( $target ).parents('li:eq(0)').addClass('disabled');
					}
					else
					{
						$('.disabled input', $sortable).each(function ()
						{
							$(this).blur();
							$(this).parents('li:eq(0)').removeClass('disabled');
						});
					}
					return false;
				});

				$('.expander', $sortable).click(function ()
				{
					if ($('.options:visible', $sortable).get(0) !== $(this).parent().next().get(0))
					{
						$('.options:visible', $sortable).slideToggle(200);
						$(this).parent().next().slideToggle(200);
					}
					else
					{
						$(this).parent().next().slideUp(200);
					}
					return false;
				});

				$( '.options', $sortable ).slideUp(0);

				sortIt($sortable);

				if( opts.dev === true )
				{
					setInterval( function()
					{
						$( '> li', sortable ).each( function()
						{
							var $tmp = $( '<div class="dev"></div>' );
							$( '<p><strong>Tabs</strong> ' + $(this)[0].pmmenu.tabs + '</p>' ).appendTo( $tmp );
							$( '<p><strong>Tab Limit</strong> ' + $(this)[0].pmmenu.tabLimit + '</p>' ).appendTo( $tmp );
							$( ".dev", $(this) ).remove();
							$tmp.appendTo( $(this) );
						});
					}, 500 );
				}
			}

			var sortIt = function ( $sortable$ )
			{
				sortable.sortable(
				{
					items: '> li',

					placeholder: "ghost",

					cancel : '.disabled',

					appendTo: document.body,

					create : function( e, ui )
					{
						var items = $( 'li[class!="ghost"]', $(this) );

						items.each( function( i )
						{
							var tabLimit = i == 0 ? 0 : 1;

							$(this)[0].pmmenu = {
								tabs : 0,
								tabsLast : 0,
								tabWidth : 40,
								continue : true,
								tabLimit : tabLimit
							};

						});
					},

					start : function( e, ui )
					{
						// Carry relevent children with the item on move...
						var tmp = $('<ul class="tmp"></ul>');
						ui.item.nextAll('li[class!="ghost"]').each(function()
						{
							var item = $(this);
							if( item[0].pmmenu.tabs > ui.item[0].pmmenu.tabs )
							{
								$(this).appendTo(tmp);
							}
						});
						if( $( '> li', tmp ).length !== 0 )
						{
							tmp.appendTo( $('body') );
							sortable.sortable( "refresh" );
						}

						ui.placeholder.height(ui.item.height());
						ui.item[0].pmmenu.tabsLast = ui.item[0].pmmenu.tabs;
						ui.placeholder.css( 'left', ( ui.item[0].pmmenu.tabs * ui.item[0].pmmenu.tabWidth ) + 'px' );
					},

					sort : function( e, ui )
					{

						var beforePlaceholder = ui.placeholder.prevAll('li[class!="ui-sortable-helper"]:eq(0)');

						if( beforePlaceholder.length !== 0 )
						{
							var maxTabs = ( beforePlaceholder[0].pmmenu.tabs + 1 ),
								discount = ( ( ui.item[0].pmmenu.tabs + 1 ) * ui.item[0].pmmenu.tabWidth ),
								noDiscount = ( ( ui.item[0].pmmenu.tabs - 1 ) * ui.item[0].pmmenu.tabWidth );

							if( ui.item[0].pmmenu.tabs < maxTabs )
							{
								if( ui.position.left > discount && ui.item[0].pmmenu.continue === true )
								// If moving to the right...
								{
									ui.item[0].pmmenu.continue = false;
									ui.placeholder.stop(true, true).animate({
										left : '+=' + ui.item[0].pmmenu.tabWidth
									}, 0, function()
									{
										ui.item[0].pmmenu.tabs++;
										ui.placeholder.css( 'left', discount + 'px' );
										ui.item[0].pmmenu.continue = true;

									});
								}
								else if( noDiscount >= 0 && ui.position.left < noDiscount && ui.item[0].pmmenu.continue === true  )
								// If moving back to the left...
								{
									ui.item[0].pmmenu.continue = false;
									ui.placeholder.stop(true, true).animate({
										left : '-=' + ui.item[0].pmmenu.tabWidth
									}, 0, function()
									{
										ui.item[0].pmmenu.tabs--;
										ui.placeholder.css( 'left', noDiscount + 'px' );
										ui.item[0].pmmenu.continue = true;

									});
								}
							}
							else
							{
								if( noDiscount >= 0 && ui.position.left < noDiscount && ui.item[0].pmmenu.continue === true  )
								// If moving back to the left...
								{
									ui.item[0].pmmenu.continue = false;
									ui.placeholder.stop(true, true).animate({
										left : '-=' + ui.item[0].pmmenu.tabWidth
									}, 0, function()
									{
										ui.item[0].pmmenu.tabs--;
										ui.placeholder.css( 'left', noDiscount + 'px' );
										ui.item[0].pmmenu.continue = true;

									});
								}
								else
								{
									ui.item[0].pmmenu.tabs = maxTabs;
									ui.placeholder.css( 'left', ( maxTabs * ui.item[0].pmmenu.tabWidth ) + 'px' );
								}
							}
						}
						else
						{
							ui.item[0].pmmenu.tabs = 0
							ui.placeholder.css( 'left', '0px' );
						}
					},

					stop : function( e, ui )
					{

						ui.item.css( 'left', ( ui.item[0].pmmenu.tabs * ui.item[0].pmmenu.tabWidth ) + 'px' );
						var tmp = $('<div></div>');
						if( $('> .tmp', $('body') ).length !== 0 )
						{
							$( '> .tmp', $('body') ).appendTo(tmp);
							$( $('> .tmp > li', tmp ).get().reverse() ).each( function()
							{
								var diff = Math.abs( ui.item[0].pmmenu.tabs - ui.item[0].pmmenu.tabsLast );
								if( ui.item[0].pmmenu.tabs > ui.item[0].pmmenu.tabsLast )
								{
									$(this)[0].pmmenu.tabs += diff;
								}
								else
								{
									$(this)[0].pmmenu.tabs -= diff;
								}
								$(this)[0].pmmenu.tabsLimit = $(this)[0].pmmenu.tabs;
								$(this).insertAfter(ui.item);
								$(this).css( 'left', ( $(this)[0].pmmenu.tabs * $(this)[0].pmmenu.tabWidth ) + 'px' );
							});
							sortable.sortable( "refresh" );
						}
					}

				});
			}

			$(this).each(function (i)
			{
				init(this, i);
			});

			return $(this);
		}
	});
})(jQuery);