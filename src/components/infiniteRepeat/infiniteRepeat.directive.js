/**
 * @ngdoc module
 * @name infinteRepeat
 */
angular
  .module('brMaterial')
  .directive('brInfiniteRepeat', repeateDirective);

var NUM_EXTRA = 4;

/**
 * @ngdoc directive
 * @name brInfiniteRepeat
 * @module infinteRepeat
 *
 * @description
 * `[br-infiinite-repeat]` is a replacement for ng-repeat that will render only enough items to display in the visible area.
 * The items are then swapped out as you scroll. This should be able to hanlde large amounts of data without creating performace issues
 *
 *
 * @usage
 * <hljs lang="html">
 * <br-infinite-repeat-container>
 * 	<div br-inifinte-repeat="item in list">
 * 		{{item.name}}
 * 	</div>
 * </br-infinite-repeat-container>
 * </hljs>
 */
repeateDirective.$inject = ['$parse', '$document', '$timeout'];
function repeateDirective ($parse, $document, $timeout) {
  var directive = {
    restrict: 'A',
    require: ['^^brInfiniteRepeatContainer'],
    priority: 1000,
    terminal: true,
    transclude: 'element',
    compile: compile
  };
  return directive;




  function compile(tElement, tAttrs) {
    var expression = tAttrs.brInfiniteRepeat;
    var match = expression.match(/^\s*([\s\S]+?)\s+in\s+([\s\S]+?)\s*$/);
    var repeatName = match[1];
    var repeatListExpression = $parse(match[2]);
    var extraName = tAttrs.brExtraName && $parse(tAttrs.brExtraName);

    return function link(scope, element, attrs, ctrl, transclude) {
      var containerCtrl = ctrl[0];
      var items;
      var itemsLength = 0;
      var itemsHeight = 0;
      var avgSize = 0;

      var itemSize = scope.$eval(attrs.brItemSize) || undefined;
      var parentNode = element[0].parentNode;

      var blocks = {};
      var pooledBlocks = [];

      var inited = false;
      var watching = false;

      var scrollSize = 0;
      var startIndex = 0;
      var endIndex = 0;
      var newStartIndex = 0;
      var newEndIndex = 0;
      var newVisibleEnd = 0;

      var heightRef = [];



      containerCtrl.updateContainer(function () {
        if (watching === false) {
          watching = true;
          scope.$watchCollection(repeatListExpression, virtualRepeatUpdate);
        }

        updateIndexes();

        if (newStartIndex !== startIndex || newEndIndex !== endIndex || containerCtrl.getScrollOffset() > scrollSize) {
          virtualRepeatUpdate(items, items);
        }
      });



      function virtualRepeatUpdate(newItems, oldItems) {
        var i;
        var index;
        var keys;
        var block_;
        var itemsLength_ = newItems && newItems.length || 0;
        var lengthChanged = false;
        var newStartBlocks_ = [];
        var newEndBlocks_ = [];

        // If the number of items shrank, scroll up to the top.
        if (items && itemsLength < items.length && containerCtrl.getScrollOffset() !== 0) {
          items = newItems;
          containerCtrl.resetScroll();
          return;
        }

        if (itemsLength_ !== itemsLength) {
          containerCtrl.updateAutoHeight();
          lengthChanged = true;
          itemsLength = itemsLength_;
        }


        items = newItems;
        if (inited === false) {
          inited = true;
          calculateLength();
        } else if (newItems !== oldItems || lengthChanged === true) {
          updateIndexes();
        }


        if (lengthChanged === true) {
          calculateLength();
          containerCtrl.setScrollTop(0);
        }


        // Detach and pool any blocks that are no longer in the viewport.
        keys = Object.keys(blocks);
        for (i = 0; i < keys.length; ++i) {
          index = parseInt(keys[i], 10);
          if (index < newStartIndex || index >= newEndIndex) {
            poolBlock(index);
          }
        }



        // Collect blocks at the top.
        for (i = newStartIndex; i < newEndIndex && (blocks[i] === null || blocks[i] === undefined); i++) {
          block_ = getBlock(i);
          updateBlock(block_, i);
          newStartBlocks_.push(block_);
        }


        // Update blocks that are already rendered.
        for (; (blocks[i] !== null && blocks[i] !== undefined); i++) {
          updateBlock(blocks[i], i);
        }
        var maxIndex = i - 1;


        // Collect blocks at the end.
        for (; i < newEndIndex; i++) {
          block_ = getBlock(i);
          updateBlock(block_, i);
          newEndBlocks_.push(block_);
        }


        // Attach collected blocks to the document.
        if (newStartBlocks_.length) {
          parentNode.insertBefore(
              domFragmentFromBlocks(newStartBlocks_),
              element[0].nextSibling);
        }
        if (newEndBlocks_.length) {
          parentNode.insertBefore(
              domFragmentFromBlocks(newEndBlocks_),
              blocks[maxIndex] && blocks[maxIndex].element[0].nextSibling);
        }

        startIndex = newStartIndex;
        endIndex = newEndIndex;
      }





      function updateIndexes() {
        checkHeights();

        var containerHeight = containerCtrl.getSize();
        var offset = containerCtrl.getScrollOffset();

        var itemOffsetHeigt = 0;
        var itemOffsetCount = 0;
        var itemExtraHeight = 0;
        var i = 0;

        var itemContainerHeight = 0;
        var containerCount = 0;

        heightRef.every(function (num) {
          // get the heigt and count of items in the offset area
          if (itemOffsetHeigt + num <= offset) {
            itemOffsetHeigt += num;
            itemOffsetCount++;
            return true;
          }


          itemContainerHeight += num;
          containerCount++;
          if (itemContainerHeight >= containerHeight) { return false; }

          return true;
        });


        newStartIndex = Math.max(0, itemOffsetCount);
        newVisibleEnd = newStartIndex + containerCount + NUM_EXTRA;
        newEndIndex = Math.min(itemsLength, newVisibleEnd);
        newStartIndex = Math.max(0, newStartIndex - NUM_EXTRA);

        for (i; i < newStartIndex; ++i) {
          itemExtraHeight += heightRef[i];
        }

        containerCtrl.setTransform(itemExtraHeight);
      }


      function checkHeights() {
        var blockHeight;
        var hightChange = false;

        Object.keys(blocks).forEach(function(blockIndex) {
          var index = parseInt(blockIndex, 10);
          if (index >= newStartIndex || index < newEndIndex) {
            blockHeight = blocks[index].element[0].offsetHeight;
            if (blockHeight !== heightRef[index]) {
              hightChange = true;
              heightRef[index] = blockHeight;
            }
          }
        });

        if (hightChange) {
          itemsHeight = 0;
          // fast way of geting sum from array
          var copy = heightRef.concat();
          while(copy.length) {
            itemsHeight += copy.pop();
          }

          avgSize = Math.round(itemsHeight / heightRef.length);
          containerCtrl.setScrollSize(itemsHeight);
        }
      }




      function domFragmentFromBlocks(blocks) {
        var fragment = $document[0].createDocumentFragment();
        blocks.forEach(function(block) {
          fragment.appendChild(block.element[0]);
        });
        return fragment;
      }


      function calculateLength() {
        var height = 0;
        var index = 0;
        var targetSize = containerCtrl.getSize();
        var itemSize = getBlockSize();

        while(index < itemsLength && height < targetSize) {
          height += itemSize;
          index++;
        }

        heightRef = Array.apply(null, Array(itemsLength)).map(function () { return itemSize; });
        scrollSize = itemsLength * itemSize;

        var itemsHeight = 0;
        // fast way of geting sum from array
        var copy = heightRef.concat();
        while(copy.length) {
          itemsHeight += copy.pop();
        }

        containerCtrl.setScrollSize(itemsHeight);
        startIndex = 0;
        newStartIndex = 0;
        endIndex = index - 1;
        newEndIndex = endIndex;

        $timeout(function () {
					updateIndexes();

	        if (newStartIndex !== startIndex || newEndIndex !== endIndex || containerCtrl.getScrollOffset() > scrollSize) {
	          virtualRepeatUpdate(items, items);
	        }
				}, 0);
      }

      function getBlockSize () {
        var block;
        transclude(function(clone, scope) {
          block = {
            element: clone,
            new: true,
            scope: scope
          };
        });
        if (!block.element[0].parentNode) {
          parentNode.appendChild(block.element[0]);
        }
        var itemSize = block.element[0].offsetHeight || 0;
        parentNode.removeChild(block.element[0]);

        return itemSize;
      }

      function getBlock (index) {
        if (pooledBlocks.length) {
          return pooledBlocks.pop();
        }

        var block;
        transclude(function(clone, scope) {
          block = {
            element: clone,
            new: true,
            scope: scope
          };

          updateScope(scope, index);
          parentNode.appendChild(clone[0]);
        });

        return block;
      }

      function updateBlock(block, index) {
        blocks[index] = block;

        if (index % 2 === 1) { block.element.addClass('br-odd'); }
        else { block.element.removeClass('br-odd'); }

        if (!block.new &&
            (block.scope.$index === index && block.scope[repeatName] === items[index])) {
          return;
        }
        block.new = false;

        // Update and digest the block's scope.
        updateScope(block.scope, index);

        // Perform digest before reattaching the block.
        // Any resulting synchronous dom mutations should be much faster as a result.
        // This might break some directives, but I'm going to try it for now.
        if (!scope.$root.$$phase) {
          block.scope.$digest();
        }
      }


      function updateScope ($scope, index) {
        $scope.$index = index;
        $scope[repeatName] = items && items[index];
        if (extraName) $scope[extraName($scope)] = items[index];
      }

      function poolBlock (index) {
        pooledBlocks.push(blocks[index]);
        parentNode.removeChild(blocks[index].element[0]);
        delete blocks[index];
      }
    };
  }
}
