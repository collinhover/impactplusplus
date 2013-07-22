ig.module(
        'plusplus.helpers.linked-list'
    )
    .defines(function () {
        "use strict";

        /**
         * Linked list.
         * <br>- based on: http://jsclass.jcoglan.com/linkedlist.html
         * @class
         * @extends ig.Class
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.LinkedList = ig.Class.extend( {

            start: null,

            end: null,

            next: null,

            prev: null,

            length: 0,

            init: function () {

                this.length = 0;

            },

            pop: function () {

                if ( this.length > 0 ) {

                    this.remove(this.end)

                }

            },

            shift: function () {

                if ( this.length > 0 ) {

                    this.remove(this.start)

                }

            },

            push: function (newNode) {

                if ( this.length > 0 ) {

                    return this.insertAfter(this.end, newNode);

                }

                this.start = this.end = newNode.prev = newNode.next = newNode;

                this.length = 1;

            },

            unshift: function (newNode) {

                if ( this.length > 0 ) {

                    this.insertBefore(this.start, newNode);

                }
                else {

                    this.push(newNode);

                }

            },

            remove: function (removed) {

                if ( this.length > 0) {

                    if (this.length > 1) {

                        removed.prev.next = removed.next;
                        removed.next.prev = removed.prev;

                        if (removed === this.start) {

                            this.start = removed.next;

                        }

                        if (removed === this.end) {

                            this.end = removed.prev;

                        }

                    }
                    else {

                        this.start = this.end = null;

                    }

                    removed.prev = removed.next = null;

                    this.length--;

                    return removed;

                }

            },

            at: function( index ) {

                if ( index >= 0 && index < this.length ) {

                    var node = this.start;

                    while ( index-- ) {

                        node = node.next;

                    }

                    return node;

                }

            },

            insertAt: function(index, newNode) {

                if (index >= 0 && index < this.length) {

                    this.insertBefore(this.at(index), newNode);

                }

            },

            insertAfter:  function(node, newNode) {

                newNode.prev = node;
                newNode.next = node.next;
                node.next = (node.next.prev = newNode);

                if (newNode.prev === this.end) {

                    this.end = newNode;

                }

                this.length++;

            },

            insertBefore: function(node, newNode) {

                newNode.next = node;
                newNode.prev = node.prev;
                node.prev = (node.prev.next = newNode);

                if (newNode.next === this.start) {

                    this.start = newNode;

                }

                this.length++;

            },

            forEach: function( callback, context, args ) {

                var node = this.start;

                for (var i = 0, il = this.length; i < il; i++) {

                    callback.apply( context || node, args );

                    if (node === this.last) {

                        break;

                    }

                    node = node.next;

                }

            }

        });

    });