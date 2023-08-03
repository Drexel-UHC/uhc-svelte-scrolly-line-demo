
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function set_svg_attributes(node, attributes) {
        for (const key in attributes) {
            attr(node, key, attributes[key]);
        }
    }
    function set_custom_element_data(node, prop, value) {
        if (prop in node) {
            node[prop] = typeof node[prop] === 'boolean' && value === '' ? true : value;
        }
        else {
            attr(node, prop, value);
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    // unfortunately this can't be a constant as that wouldn't be tree-shakeable
    // so we cache the result instead
    let crossorigin;
    function is_crossorigin() {
        if (crossorigin === undefined) {
            crossorigin = false;
            try {
                if (typeof window !== 'undefined' && window.parent) {
                    void window.parent.document;
                }
            }
            catch (error) {
                crossorigin = true;
            }
        }
        return crossorigin;
    }
    function add_resize_listener(node, fn) {
        const computed_style = getComputedStyle(node);
        if (computed_style.position === 'static') {
            node.style.position = 'relative';
        }
        const iframe = element('iframe');
        iframe.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; ' +
            'overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: -1;');
        iframe.setAttribute('aria-hidden', 'true');
        iframe.tabIndex = -1;
        const crossorigin = is_crossorigin();
        let unsubscribe;
        if (crossorigin) {
            iframe.src = "data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}</script>";
            unsubscribe = listen(window, 'message', (event) => {
                if (event.source === iframe.contentWindow)
                    fn();
            });
        }
        else {
            iframe.src = 'about:blank';
            iframe.onload = () => {
                unsubscribe = listen(iframe.contentWindow, 'resize', fn);
            };
        }
        append(node, iframe);
        return () => {
            if (crossorigin) {
                unsubscribe();
            }
            else if (unsubscribe && iframe.contentWindow) {
                unsubscribe();
            }
            detach(iframe);
        };
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = append_empty_stylesheet(node).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = (program.b - t);
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.44.1' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    var EOL = {},
        EOF = {},
        QUOTE = 34,
        NEWLINE = 10,
        RETURN = 13;

    function objectConverter(columns) {
      return new Function("d", "return {" + columns.map(function(name, i) {
        return JSON.stringify(name) + ": d[" + i + "] || \"\"";
      }).join(",") + "}");
    }

    function customConverter(columns, f) {
      var object = objectConverter(columns);
      return function(row, i) {
        return f(object(row), i, columns);
      };
    }

    // Compute unique columns in order of discovery.
    function inferColumns(rows) {
      var columnSet = Object.create(null),
          columns = [];

      rows.forEach(function(row) {
        for (var column in row) {
          if (!(column in columnSet)) {
            columns.push(columnSet[column] = column);
          }
        }
      });

      return columns;
    }

    function pad(value, width) {
      var s = value + "", length = s.length;
      return length < width ? new Array(width - length + 1).join(0) + s : s;
    }

    function formatYear(year) {
      return year < 0 ? "-" + pad(-year, 6)
        : year > 9999 ? "+" + pad(year, 6)
        : pad(year, 4);
    }

    function formatDate(date) {
      var hours = date.getUTCHours(),
          minutes = date.getUTCMinutes(),
          seconds = date.getUTCSeconds(),
          milliseconds = date.getUTCMilliseconds();
      return isNaN(date) ? "Invalid Date"
          : formatYear(date.getUTCFullYear()) + "-" + pad(date.getUTCMonth() + 1, 2) + "-" + pad(date.getUTCDate(), 2)
          + (milliseconds ? "T" + pad(hours, 2) + ":" + pad(minutes, 2) + ":" + pad(seconds, 2) + "." + pad(milliseconds, 3) + "Z"
          : seconds ? "T" + pad(hours, 2) + ":" + pad(minutes, 2) + ":" + pad(seconds, 2) + "Z"
          : minutes || hours ? "T" + pad(hours, 2) + ":" + pad(minutes, 2) + "Z"
          : "");
    }

    function dsv(delimiter) {
      var reFormat = new RegExp("[\"" + delimiter + "\n\r]"),
          DELIMITER = delimiter.charCodeAt(0);

      function parse(text, f) {
        var convert, columns, rows = parseRows(text, function(row, i) {
          if (convert) return convert(row, i - 1);
          columns = row, convert = f ? customConverter(row, f) : objectConverter(row);
        });
        rows.columns = columns || [];
        return rows;
      }

      function parseRows(text, f) {
        var rows = [], // output rows
            N = text.length,
            I = 0, // current character index
            n = 0, // current line number
            t, // current token
            eof = N <= 0, // current token followed by EOF?
            eol = false; // current token followed by EOL?

        // Strip the trailing newline.
        if (text.charCodeAt(N - 1) === NEWLINE) --N;
        if (text.charCodeAt(N - 1) === RETURN) --N;

        function token() {
          if (eof) return EOF;
          if (eol) return eol = false, EOL;

          // Unescape quotes.
          var i, j = I, c;
          if (text.charCodeAt(j) === QUOTE) {
            while (I++ < N && text.charCodeAt(I) !== QUOTE || text.charCodeAt(++I) === QUOTE);
            if ((i = I) >= N) eof = true;
            else if ((c = text.charCodeAt(I++)) === NEWLINE) eol = true;
            else if (c === RETURN) { eol = true; if (text.charCodeAt(I) === NEWLINE) ++I; }
            return text.slice(j + 1, i - 1).replace(/""/g, "\"");
          }

          // Find next delimiter or newline.
          while (I < N) {
            if ((c = text.charCodeAt(i = I++)) === NEWLINE) eol = true;
            else if (c === RETURN) { eol = true; if (text.charCodeAt(I) === NEWLINE) ++I; }
            else if (c !== DELIMITER) continue;
            return text.slice(j, i);
          }

          // Return last token before EOF.
          return eof = true, text.slice(j, N);
        }

        while ((t = token()) !== EOF) {
          var row = [];
          while (t !== EOL && t !== EOF) row.push(t), t = token();
          if (f && (row = f(row, n++)) == null) continue;
          rows.push(row);
        }

        return rows;
      }

      function preformatBody(rows, columns) {
        return rows.map(function(row) {
          return columns.map(function(column) {
            return formatValue(row[column]);
          }).join(delimiter);
        });
      }

      function format(rows, columns) {
        if (columns == null) columns = inferColumns(rows);
        return [columns.map(formatValue).join(delimiter)].concat(preformatBody(rows, columns)).join("\n");
      }

      function formatBody(rows, columns) {
        if (columns == null) columns = inferColumns(rows);
        return preformatBody(rows, columns).join("\n");
      }

      function formatRows(rows) {
        return rows.map(formatRow).join("\n");
      }

      function formatRow(row) {
        return row.map(formatValue).join(delimiter);
      }

      function formatValue(value) {
        return value == null ? ""
            : value instanceof Date ? formatDate(value)
            : reFormat.test(value += "") ? "\"" + value.replace(/"/g, "\"\"") + "\""
            : value;
      }

      return {
        parse: parse,
        parseRows: parseRows,
        format: format,
        formatBody: formatBody,
        formatRows: formatRows,
        formatRow: formatRow,
        formatValue: formatValue
      };
    }

    var csv = dsv(",");

    var csvParse = csv.parse;

    function autoType(object) {
      for (var key in object) {
        var value = object[key].trim(), number, m;
        if (!value) value = null;
        else if (value === "true") value = true;
        else if (value === "false") value = false;
        else if (value === "NaN") value = NaN;
        else if (!isNaN(number = +value)) value = number;
        else if (m = value.match(/^([-+]\d{2})?\d{4}(-\d{2}(-\d{2})?)?(T\d{2}:\d{2}(:\d{2}(\.\d{3})?)?(Z|[-+]\d{2}:\d{2})?)?$/)) {
          if (fixtz && !!m[4] && !m[7]) value = value.replace(/-/g, "/").replace(/T/, " ");
          value = new Date(value);
        }
        else continue;
        object[key] = value;
      }
      return object;
    }

    // https://github.com/d3/d3-dsv/issues/45
    const fixtz = new Date("2019-01-01T00:00").getHours() || new Date("2019-07-01T00:00").getHours();

    // CORE FUNCTIONS
    function setColors(themes, theme) {
      for (let color in themes[theme]) {
        document.documentElement.style.setProperty('--' + color, themes[theme][color]);
      }
    }

    function getMotion() {
      let mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)"); // Check if browser prefers reduced motion
    	return !mediaQuery || mediaQuery.matches ? false : true; // return true for motion, false for no motion
    }

    // DEMO-SPECIFIC FUNCTIONS
    async function getData(url) {
      let response = await fetch(url);
      let string = await response.text();
    	let data = await csvParse(string, autoType);
      return data;
    }

    function getColor(value, breaks, colors) {
      let color;
      let found = false;
      let i = 1;
      while (found == false) {
        if (value <= breaks[i]) {
          color = colors[i - 1];
          found = true;
        } else {
          i ++;
        }
      }
      return color ? color : 'lightgrey';
    }

    function getBreaks(vals) {
    	let len = vals.length;
    	let breaks = [
    		vals[0],
    		vals[Math.floor(len * 0.2)],
    		vals[Math.floor(len * 0.4)],
    		vals[Math.floor(len * 0.6)],
    		vals[Math.floor(len * 0.8)],
    		vals[len - 1]
    	];
    	return breaks;
    }

    // CORE CONFIG
    const themes = {
      'light': {
        'text': '#222',
        'muted': '#777',
        'pale': '#f0f0f0',
        'background': '#fff'
      },
      'dark': {
        'text': '#fff',
        'muted': '#bbb',
        'pale': '#333',
        'background': '#222'
      },
      'lightblue': {
        'text': '#206095',
        'muted': '#707070',
        'pale': '#f0f0f0',
        'background': 'rgb(188, 207, 222)'
      }
    };

    // DEMO-SPECIFIC CONFIG

    const colors = {
      seq: ['rgb(234, 236, 177)', 'rgb(169, 216, 145)', 'rgb(0, 167, 186)', 'rgb(0, 78, 166)', 'rgb(0, 13, 84)'],
      cat: ['#206095', '#A8BD3A', '#003C57', '#27A0CC', '#118C7B', '#F66068', '#746CB1', '#22D0B6', 'lightgrey']
    };

    /* src\layout\UHCHeader.svelte generated by Svelte v3.44.1 */
    const file = "src\\layout\\UHCHeader.svelte";

    function create_fragment(ctx) {
    	let nav;
    	let div1;
    	let a;
    	let div0;
    	let img;
    	let img_src_value;
    	let nav_style_value;

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			div1 = element("div");
    			a = element("a");
    			div0 = element("div");
    			img = element("img");
    			attr_dev(img, "id", "my-svg");
    			if (!src_url_equal(img.src, img_src_value = "./img/uhc-primary-blue_black.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Drexel Urban Health Collaborative");
    			attr_dev(img, "class", "svelte-dmeou9");
    			add_location(img, file, 17, 8, 485);
    			attr_dev(div0, "id", "svg-container");
    			attr_dev(div0, "class", "svelte-dmeou9");
    			add_location(div0, file, 16, 6, 451);
    			attr_dev(a, "href", "https://drexel.edu/uhc/");
    			attr_dev(a, "class", "svelte-dmeou9");
    			add_location(a, file, 15, 4, 409);
    			attr_dev(div1, "class", "col-wide middle");
    			toggle_class(div1, "center", /*center*/ ctx[2]);
    			add_location(div1, file, 14, 2, 361);

    			attr_dev(nav, "style", nav_style_value = "border-bottom-color: " + themes[/*theme*/ ctx[0]]['muted'] + "; " + (/*filled*/ ctx[1]
    			? 'background-color: ' + themes[/*theme*/ ctx[0]]['background'] + ';'
    			: ''));

    			attr_dev(nav, "class", "svelte-dmeou9");
    			add_location(nav, file, 9, 0, 209);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, div1);
    			append_dev(div1, a);
    			append_dev(a, div0);
    			append_dev(div0, img);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*center*/ 4) {
    				toggle_class(div1, "center", /*center*/ ctx[2]);
    			}

    			if (dirty & /*theme, filled*/ 3 && nav_style_value !== (nav_style_value = "border-bottom-color: " + themes[/*theme*/ ctx[0]]['muted'] + "; " + (/*filled*/ ctx[1]
    			? 'background-color: ' + themes[/*theme*/ ctx[0]]['background'] + ';'
    			: ''))) {
    				attr_dev(nav, "style", nav_style_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('UHCHeader', slots, []);
    	let { theme = getContext('theme') } = $$props;
    	let { filled = false } = $$props;
    	let { center = true } = $$props;
    	const writable_props = ['theme', 'filled', 'center'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<UHCHeader> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('theme' in $$props) $$invalidate(0, theme = $$props.theme);
    		if ('filled' in $$props) $$invalidate(1, filled = $$props.filled);
    		if ('center' in $$props) $$invalidate(2, center = $$props.center);
    	};

    	$$self.$capture_state = () => ({
    		themes,
    		getContext,
    		theme,
    		filled,
    		center
    	});

    	$$self.$inject_state = $$props => {
    		if ('theme' in $$props) $$invalidate(0, theme = $$props.theme);
    		if ('filled' in $$props) $$invalidate(1, filled = $$props.filled);
    		if ('center' in $$props) $$invalidate(2, center = $$props.center);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [theme, filled, center];
    }

    class UHCHeader extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { theme: 0, filled: 1, center: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "UHCHeader",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get theme() {
    		throw new Error("<UHCHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set theme(value) {
    		throw new Error("<UHCHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get filled() {
    		throw new Error("<UHCHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set filled(value) {
    		throw new Error("<UHCHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get center() {
    		throw new Error("<UHCHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set center(value) {
    		throw new Error("<UHCHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const matchIconName = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    const stringToIcon = (value, validate, allowSimpleName, provider = "") => {
      const colonSeparated = value.split(":");
      if (value.slice(0, 1) === "@") {
        if (colonSeparated.length < 2 || colonSeparated.length > 3) {
          return null;
        }
        provider = colonSeparated.shift().slice(1);
      }
      if (colonSeparated.length > 3 || !colonSeparated.length) {
        return null;
      }
      if (colonSeparated.length > 1) {
        const name2 = colonSeparated.pop();
        const prefix = colonSeparated.pop();
        const result = {
          // Allow provider without '@': "provider:prefix:name"
          provider: colonSeparated.length > 0 ? colonSeparated[0] : provider,
          prefix,
          name: name2
        };
        return validate && !validateIconName(result) ? null : result;
      }
      const name = colonSeparated[0];
      const dashSeparated = name.split("-");
      if (dashSeparated.length > 1) {
        const result = {
          provider,
          prefix: dashSeparated.shift(),
          name: dashSeparated.join("-")
        };
        return validate && !validateIconName(result) ? null : result;
      }
      if (allowSimpleName && provider === "") {
        const result = {
          provider,
          prefix: "",
          name
        };
        return validate && !validateIconName(result, allowSimpleName) ? null : result;
      }
      return null;
    };
    const validateIconName = (icon, allowSimpleName) => {
      if (!icon) {
        return false;
      }
      return !!((icon.provider === "" || icon.provider.match(matchIconName)) && (allowSimpleName && icon.prefix === "" || icon.prefix.match(matchIconName)) && icon.name.match(matchIconName));
    };

    const defaultIconDimensions = Object.freeze(
      {
        left: 0,
        top: 0,
        width: 16,
        height: 16
      }
    );
    const defaultIconTransformations = Object.freeze({
      rotate: 0,
      vFlip: false,
      hFlip: false
    });
    const defaultIconProps = Object.freeze({
      ...defaultIconDimensions,
      ...defaultIconTransformations
    });
    const defaultExtendedIconProps = Object.freeze({
      ...defaultIconProps,
      body: "",
      hidden: false
    });

    function mergeIconTransformations(obj1, obj2) {
      const result = {};
      if (!obj1.hFlip !== !obj2.hFlip) {
        result.hFlip = true;
      }
      if (!obj1.vFlip !== !obj2.vFlip) {
        result.vFlip = true;
      }
      const rotate = ((obj1.rotate || 0) + (obj2.rotate || 0)) % 4;
      if (rotate) {
        result.rotate = rotate;
      }
      return result;
    }

    function mergeIconData(parent, child) {
      const result = mergeIconTransformations(parent, child);
      for (const key in defaultExtendedIconProps) {
        if (key in defaultIconTransformations) {
          if (key in parent && !(key in result)) {
            result[key] = defaultIconTransformations[key];
          }
        } else if (key in child) {
          result[key] = child[key];
        } else if (key in parent) {
          result[key] = parent[key];
        }
      }
      return result;
    }

    function getIconsTree(data, names) {
      const icons = data.icons;
      const aliases = data.aliases || /* @__PURE__ */ Object.create(null);
      const resolved = /* @__PURE__ */ Object.create(null);
      function resolve(name) {
        if (icons[name]) {
          return resolved[name] = [];
        }
        if (!(name in resolved)) {
          resolved[name] = null;
          const parent = aliases[name] && aliases[name].parent;
          const value = parent && resolve(parent);
          if (value) {
            resolved[name] = [parent].concat(value);
          }
        }
        return resolved[name];
      }
      (names || Object.keys(icons).concat(Object.keys(aliases))).forEach(resolve);
      return resolved;
    }

    function internalGetIconData(data, name, tree) {
      const icons = data.icons;
      const aliases = data.aliases || /* @__PURE__ */ Object.create(null);
      let currentProps = {};
      function parse(name2) {
        currentProps = mergeIconData(
          icons[name2] || aliases[name2],
          currentProps
        );
      }
      parse(name);
      tree.forEach(parse);
      return mergeIconData(data, currentProps);
    }

    function parseIconSet(data, callback) {
      const names = [];
      if (typeof data !== "object" || typeof data.icons !== "object") {
        return names;
      }
      if (data.not_found instanceof Array) {
        data.not_found.forEach((name) => {
          callback(name, null);
          names.push(name);
        });
      }
      const tree = getIconsTree(data);
      for (const name in tree) {
        const item = tree[name];
        if (item) {
          callback(name, internalGetIconData(data, name, item));
          names.push(name);
        }
      }
      return names;
    }

    const optionalPropertyDefaults = {
      provider: "",
      aliases: {},
      not_found: {},
      ...defaultIconDimensions
    };
    function checkOptionalProps(item, defaults) {
      for (const prop in defaults) {
        if (prop in item && typeof item[prop] !== typeof defaults[prop]) {
          return false;
        }
      }
      return true;
    }
    function quicklyValidateIconSet(obj) {
      if (typeof obj !== "object" || obj === null) {
        return null;
      }
      const data = obj;
      if (typeof data.prefix !== "string" || !obj.icons || typeof obj.icons !== "object") {
        return null;
      }
      if (!checkOptionalProps(obj, optionalPropertyDefaults)) {
        return null;
      }
      const icons = data.icons;
      for (const name in icons) {
        const icon = icons[name];
        if (!name.match(matchIconName) || typeof icon.body !== "string" || !checkOptionalProps(
          icon,
          defaultExtendedIconProps
        )) {
          return null;
        }
      }
      const aliases = data.aliases || /* @__PURE__ */ Object.create(null);
      for (const name in aliases) {
        const icon = aliases[name];
        const parent = icon.parent;
        if (!name.match(matchIconName) || typeof parent !== "string" || !icons[parent] && !aliases[parent] || !checkOptionalProps(
          icon,
          defaultExtendedIconProps
        )) {
          return null;
        }
      }
      return data;
    }

    const dataStorage = /* @__PURE__ */ Object.create(null);
    function newStorage(provider, prefix) {
      return {
        provider,
        prefix,
        icons: /* @__PURE__ */ Object.create(null),
        missing: /* @__PURE__ */ new Set()
      };
    }
    function getStorage(provider, prefix) {
      const providerStorage = dataStorage[provider] || (dataStorage[provider] = /* @__PURE__ */ Object.create(null));
      return providerStorage[prefix] || (providerStorage[prefix] = newStorage(provider, prefix));
    }
    function addIconSet(storage, data) {
      if (!quicklyValidateIconSet(data)) {
        return [];
      }
      return parseIconSet(data, (name, icon) => {
        if (icon) {
          storage.icons[name] = icon;
        } else {
          storage.missing.add(name);
        }
      });
    }
    function addIconToStorage(storage, name, icon) {
      try {
        if (typeof icon.body === "string") {
          storage.icons[name] = { ...icon };
          return true;
        }
      } catch (err) {
      }
      return false;
    }
    function listIcons(provider, prefix) {
      let allIcons = [];
      const providers = typeof provider === "string" ? [provider] : Object.keys(dataStorage);
      providers.forEach((provider2) => {
        const prefixes = typeof provider2 === "string" && typeof prefix === "string" ? [prefix] : Object.keys(dataStorage[provider2] || {});
        prefixes.forEach((prefix2) => {
          const storage = getStorage(provider2, prefix2);
          allIcons = allIcons.concat(
            Object.keys(storage.icons).map(
              (name) => (provider2 !== "" ? "@" + provider2 + ":" : "") + prefix2 + ":" + name
            )
          );
        });
      });
      return allIcons;
    }

    let simpleNames = false;
    function allowSimpleNames(allow) {
      if (typeof allow === "boolean") {
        simpleNames = allow;
      }
      return simpleNames;
    }
    function getIconData(name) {
      const icon = typeof name === "string" ? stringToIcon(name, true, simpleNames) : name;
      if (icon) {
        const storage = getStorage(icon.provider, icon.prefix);
        const iconName = icon.name;
        return storage.icons[iconName] || (storage.missing.has(iconName) ? null : void 0);
      }
    }
    function addIcon(name, data) {
      const icon = stringToIcon(name, true, simpleNames);
      if (!icon) {
        return false;
      }
      const storage = getStorage(icon.provider, icon.prefix);
      return addIconToStorage(storage, icon.name, data);
    }
    function addCollection(data, provider) {
      if (typeof data !== "object") {
        return false;
      }
      if (typeof provider !== "string") {
        provider = data.provider || "";
      }
      if (simpleNames && !provider && !data.prefix) {
        let added = false;
        if (quicklyValidateIconSet(data)) {
          data.prefix = "";
          parseIconSet(data, (name, icon) => {
            if (icon && addIcon(name, icon)) {
              added = true;
            }
          });
        }
        return added;
      }
      const prefix = data.prefix;
      if (!validateIconName({
        provider,
        prefix,
        name: "a"
      })) {
        return false;
      }
      const storage = getStorage(provider, prefix);
      return !!addIconSet(storage, data);
    }
    function iconExists(name) {
      return !!getIconData(name);
    }
    function getIcon(name) {
      const result = getIconData(name);
      return result ? {
        ...defaultIconProps,
        ...result
      } : null;
    }

    const defaultIconSizeCustomisations = Object.freeze({
      width: null,
      height: null
    });
    const defaultIconCustomisations = Object.freeze({
      // Dimensions
      ...defaultIconSizeCustomisations,
      // Transformations
      ...defaultIconTransformations
    });

    const unitsSplit = /(-?[0-9.]*[0-9]+[0-9.]*)/g;
    const unitsTest = /^-?[0-9.]*[0-9]+[0-9.]*$/g;
    function calculateSize(size, ratio, precision) {
      if (ratio === 1) {
        return size;
      }
      precision = precision || 100;
      if (typeof size === "number") {
        return Math.ceil(size * ratio * precision) / precision;
      }
      if (typeof size !== "string") {
        return size;
      }
      const oldParts = size.split(unitsSplit);
      if (oldParts === null || !oldParts.length) {
        return size;
      }
      const newParts = [];
      let code = oldParts.shift();
      let isNumber = unitsTest.test(code);
      while (true) {
        if (isNumber) {
          const num = parseFloat(code);
          if (isNaN(num)) {
            newParts.push(code);
          } else {
            newParts.push(Math.ceil(num * ratio * precision) / precision);
          }
        } else {
          newParts.push(code);
        }
        code = oldParts.shift();
        if (code === void 0) {
          return newParts.join("");
        }
        isNumber = !isNumber;
      }
    }

    const isUnsetKeyword = (value) => value === "unset" || value === "undefined" || value === "none";
    function iconToSVG(icon, customisations) {
      const fullIcon = {
        ...defaultIconProps,
        ...icon
      };
      const fullCustomisations = {
        ...defaultIconCustomisations,
        ...customisations
      };
      const box = {
        left: fullIcon.left,
        top: fullIcon.top,
        width: fullIcon.width,
        height: fullIcon.height
      };
      let body = fullIcon.body;
      [fullIcon, fullCustomisations].forEach((props) => {
        const transformations = [];
        const hFlip = props.hFlip;
        const vFlip = props.vFlip;
        let rotation = props.rotate;
        if (hFlip) {
          if (vFlip) {
            rotation += 2;
          } else {
            transformations.push(
              "translate(" + (box.width + box.left).toString() + " " + (0 - box.top).toString() + ")"
            );
            transformations.push("scale(-1 1)");
            box.top = box.left = 0;
          }
        } else if (vFlip) {
          transformations.push(
            "translate(" + (0 - box.left).toString() + " " + (box.height + box.top).toString() + ")"
          );
          transformations.push("scale(1 -1)");
          box.top = box.left = 0;
        }
        let tempValue;
        if (rotation < 0) {
          rotation -= Math.floor(rotation / 4) * 4;
        }
        rotation = rotation % 4;
        switch (rotation) {
          case 1:
            tempValue = box.height / 2 + box.top;
            transformations.unshift(
              "rotate(90 " + tempValue.toString() + " " + tempValue.toString() + ")"
            );
            break;
          case 2:
            transformations.unshift(
              "rotate(180 " + (box.width / 2 + box.left).toString() + " " + (box.height / 2 + box.top).toString() + ")"
            );
            break;
          case 3:
            tempValue = box.width / 2 + box.left;
            transformations.unshift(
              "rotate(-90 " + tempValue.toString() + " " + tempValue.toString() + ")"
            );
            break;
        }
        if (rotation % 2 === 1) {
          if (box.left !== box.top) {
            tempValue = box.left;
            box.left = box.top;
            box.top = tempValue;
          }
          if (box.width !== box.height) {
            tempValue = box.width;
            box.width = box.height;
            box.height = tempValue;
          }
        }
        if (transformations.length) {
          body = '<g transform="' + transformations.join(" ") + '">' + body + "</g>";
        }
      });
      const customisationsWidth = fullCustomisations.width;
      const customisationsHeight = fullCustomisations.height;
      const boxWidth = box.width;
      const boxHeight = box.height;
      let width;
      let height;
      if (customisationsWidth === null) {
        height = customisationsHeight === null ? "1em" : customisationsHeight === "auto" ? boxHeight : customisationsHeight;
        width = calculateSize(height, boxWidth / boxHeight);
      } else {
        width = customisationsWidth === "auto" ? boxWidth : customisationsWidth;
        height = customisationsHeight === null ? calculateSize(width, boxHeight / boxWidth) : customisationsHeight === "auto" ? boxHeight : customisationsHeight;
      }
      const attributes = {};
      const setAttr = (prop, value) => {
        if (!isUnsetKeyword(value)) {
          attributes[prop] = value.toString();
        }
      };
      setAttr("width", width);
      setAttr("height", height);
      attributes.viewBox = box.left.toString() + " " + box.top.toString() + " " + boxWidth.toString() + " " + boxHeight.toString();
      return {
        attributes,
        body
      };
    }

    const regex = /\sid="(\S+)"/g;
    const randomPrefix = "IconifyId" + Date.now().toString(16) + (Math.random() * 16777216 | 0).toString(16);
    let counter = 0;
    function replaceIDs(body, prefix = randomPrefix) {
      const ids = [];
      let match;
      while (match = regex.exec(body)) {
        ids.push(match[1]);
      }
      if (!ids.length) {
        return body;
      }
      const suffix = "suffix" + (Math.random() * 16777216 | Date.now()).toString(16);
      ids.forEach((id) => {
        const newID = typeof prefix === "function" ? prefix(id) : prefix + (counter++).toString();
        const escapedID = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        body = body.replace(
          // Allowed characters before id: [#;"]
          // Allowed characters after id: [)"], .[a-z]
          new RegExp('([#;"])(' + escapedID + ')([")]|\\.[a-z])', "g"),
          "$1" + newID + suffix + "$3"
        );
      });
      body = body.replace(new RegExp(suffix, "g"), "");
      return body;
    }

    const storage = /* @__PURE__ */ Object.create(null);
    function setAPIModule(provider, item) {
      storage[provider] = item;
    }
    function getAPIModule(provider) {
      return storage[provider] || storage[""];
    }

    function createAPIConfig(source) {
      let resources;
      if (typeof source.resources === "string") {
        resources = [source.resources];
      } else {
        resources = source.resources;
        if (!(resources instanceof Array) || !resources.length) {
          return null;
        }
      }
      const result = {
        // API hosts
        resources,
        // Root path
        path: source.path || "/",
        // URL length limit
        maxURL: source.maxURL || 500,
        // Timeout before next host is used.
        rotate: source.rotate || 750,
        // Timeout before failing query.
        timeout: source.timeout || 5e3,
        // Randomise default API end point.
        random: source.random === true,
        // Start index
        index: source.index || 0,
        // Receive data after time out (used if time out kicks in first, then API module sends data anyway).
        dataAfterTimeout: source.dataAfterTimeout !== false
      };
      return result;
    }
    const configStorage = /* @__PURE__ */ Object.create(null);
    const fallBackAPISources = [
      "https://api.simplesvg.com",
      "https://api.unisvg.com"
    ];
    const fallBackAPI = [];
    while (fallBackAPISources.length > 0) {
      if (fallBackAPISources.length === 1) {
        fallBackAPI.push(fallBackAPISources.shift());
      } else {
        if (Math.random() > 0.5) {
          fallBackAPI.push(fallBackAPISources.shift());
        } else {
          fallBackAPI.push(fallBackAPISources.pop());
        }
      }
    }
    configStorage[""] = createAPIConfig({
      resources: ["https://api.iconify.design"].concat(fallBackAPI)
    });
    function addAPIProvider(provider, customConfig) {
      const config = createAPIConfig(customConfig);
      if (config === null) {
        return false;
      }
      configStorage[provider] = config;
      return true;
    }
    function getAPIConfig(provider) {
      return configStorage[provider];
    }
    function listAPIProviders() {
      return Object.keys(configStorage);
    }

    const detectFetch = () => {
      let callback;
      try {
        callback = fetch;
        if (typeof callback === "function") {
          return callback;
        }
      } catch (err) {
      }
    };
    let fetchModule = detectFetch();
    function setFetch(fetch2) {
      fetchModule = fetch2;
    }
    function getFetch() {
      return fetchModule;
    }
    function calculateMaxLength(provider, prefix) {
      const config = getAPIConfig(provider);
      if (!config) {
        return 0;
      }
      let result;
      if (!config.maxURL) {
        result = 0;
      } else {
        let maxHostLength = 0;
        config.resources.forEach((item) => {
          const host = item;
          maxHostLength = Math.max(maxHostLength, host.length);
        });
        const url = prefix + ".json?icons=";
        result = config.maxURL - maxHostLength - config.path.length - url.length;
      }
      return result;
    }
    function shouldAbort(status) {
      return status === 404;
    }
    const prepare = (provider, prefix, icons) => {
      const results = [];
      const maxLength = calculateMaxLength(provider, prefix);
      const type = "icons";
      let item = {
        type,
        provider,
        prefix,
        icons: []
      };
      let length = 0;
      icons.forEach((name, index) => {
        length += name.length + 1;
        if (length >= maxLength && index > 0) {
          results.push(item);
          item = {
            type,
            provider,
            prefix,
            icons: []
          };
          length = name.length;
        }
        item.icons.push(name);
      });
      results.push(item);
      return results;
    };
    function getPath(provider) {
      if (typeof provider === "string") {
        const config = getAPIConfig(provider);
        if (config) {
          return config.path;
        }
      }
      return "/";
    }
    const send = (host, params, callback) => {
      if (!fetchModule) {
        callback("abort", 424);
        return;
      }
      let path = getPath(params.provider);
      switch (params.type) {
        case "icons": {
          const prefix = params.prefix;
          const icons = params.icons;
          const iconsList = icons.join(",");
          const urlParams = new URLSearchParams({
            icons: iconsList
          });
          path += prefix + ".json?" + urlParams.toString();
          break;
        }
        case "custom": {
          const uri = params.uri;
          path += uri.slice(0, 1) === "/" ? uri.slice(1) : uri;
          break;
        }
        default:
          callback("abort", 400);
          return;
      }
      let defaultError = 503;
      fetchModule(host + path).then((response) => {
        const status = response.status;
        if (status !== 200) {
          setTimeout(() => {
            callback(shouldAbort(status) ? "abort" : "next", status);
          });
          return;
        }
        defaultError = 501;
        return response.json();
      }).then((data) => {
        if (typeof data !== "object" || data === null) {
          setTimeout(() => {
            if (data === 404) {
              callback("abort", data);
            } else {
              callback("next", defaultError);
            }
          });
          return;
        }
        setTimeout(() => {
          callback("success", data);
        });
      }).catch(() => {
        callback("next", defaultError);
      });
    };
    const fetchAPIModule = {
      prepare,
      send
    };

    function sortIcons(icons) {
      const result = {
        loaded: [],
        missing: [],
        pending: []
      };
      const storage = /* @__PURE__ */ Object.create(null);
      icons.sort((a, b) => {
        if (a.provider !== b.provider) {
          return a.provider.localeCompare(b.provider);
        }
        if (a.prefix !== b.prefix) {
          return a.prefix.localeCompare(b.prefix);
        }
        return a.name.localeCompare(b.name);
      });
      let lastIcon = {
        provider: "",
        prefix: "",
        name: ""
      };
      icons.forEach((icon) => {
        if (lastIcon.name === icon.name && lastIcon.prefix === icon.prefix && lastIcon.provider === icon.provider) {
          return;
        }
        lastIcon = icon;
        const provider = icon.provider;
        const prefix = icon.prefix;
        const name = icon.name;
        const providerStorage = storage[provider] || (storage[provider] = /* @__PURE__ */ Object.create(null));
        const localStorage = providerStorage[prefix] || (providerStorage[prefix] = getStorage(provider, prefix));
        let list;
        if (name in localStorage.icons) {
          list = result.loaded;
        } else if (prefix === "" || localStorage.missing.has(name)) {
          list = result.missing;
        } else {
          list = result.pending;
        }
        const item = {
          provider,
          prefix,
          name
        };
        list.push(item);
      });
      return result;
    }

    function removeCallback(storages, id) {
      storages.forEach((storage) => {
        const items = storage.loaderCallbacks;
        if (items) {
          storage.loaderCallbacks = items.filter((row) => row.id !== id);
        }
      });
    }
    function updateCallbacks(storage) {
      if (!storage.pendingCallbacksFlag) {
        storage.pendingCallbacksFlag = true;
        setTimeout(() => {
          storage.pendingCallbacksFlag = false;
          const items = storage.loaderCallbacks ? storage.loaderCallbacks.slice(0) : [];
          if (!items.length) {
            return;
          }
          let hasPending = false;
          const provider = storage.provider;
          const prefix = storage.prefix;
          items.forEach((item) => {
            const icons = item.icons;
            const oldLength = icons.pending.length;
            icons.pending = icons.pending.filter((icon) => {
              if (icon.prefix !== prefix) {
                return true;
              }
              const name = icon.name;
              if (storage.icons[name]) {
                icons.loaded.push({
                  provider,
                  prefix,
                  name
                });
              } else if (storage.missing.has(name)) {
                icons.missing.push({
                  provider,
                  prefix,
                  name
                });
              } else {
                hasPending = true;
                return true;
              }
              return false;
            });
            if (icons.pending.length !== oldLength) {
              if (!hasPending) {
                removeCallback([storage], item.id);
              }
              item.callback(
                icons.loaded.slice(0),
                icons.missing.slice(0),
                icons.pending.slice(0),
                item.abort
              );
            }
          });
        });
      }
    }
    let idCounter = 0;
    function storeCallback(callback, icons, pendingSources) {
      const id = idCounter++;
      const abort = removeCallback.bind(null, pendingSources, id);
      if (!icons.pending.length) {
        return abort;
      }
      const item = {
        id,
        icons,
        callback,
        abort
      };
      pendingSources.forEach((storage) => {
        (storage.loaderCallbacks || (storage.loaderCallbacks = [])).push(item);
      });
      return abort;
    }

    function listToIcons(list, validate = true, simpleNames = false) {
      const result = [];
      list.forEach((item) => {
        const icon = typeof item === "string" ? stringToIcon(item, validate, simpleNames) : item;
        if (icon) {
          result.push(icon);
        }
      });
      return result;
    }

    // src/config.ts
    var defaultConfig = {
      resources: [],
      index: 0,
      timeout: 2e3,
      rotate: 750,
      random: false,
      dataAfterTimeout: false
    };

    // src/query.ts
    function sendQuery(config, payload, query, done) {
      const resourcesCount = config.resources.length;
      const startIndex = config.random ? Math.floor(Math.random() * resourcesCount) : config.index;
      let resources;
      if (config.random) {
        let list = config.resources.slice(0);
        resources = [];
        while (list.length > 1) {
          const nextIndex = Math.floor(Math.random() * list.length);
          resources.push(list[nextIndex]);
          list = list.slice(0, nextIndex).concat(list.slice(nextIndex + 1));
        }
        resources = resources.concat(list);
      } else {
        resources = config.resources.slice(startIndex).concat(config.resources.slice(0, startIndex));
      }
      const startTime = Date.now();
      let status = "pending";
      let queriesSent = 0;
      let lastError;
      let timer = null;
      let queue = [];
      let doneCallbacks = [];
      if (typeof done === "function") {
        doneCallbacks.push(done);
      }
      function resetTimer() {
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
      }
      function abort() {
        if (status === "pending") {
          status = "aborted";
        }
        resetTimer();
        queue.forEach((item) => {
          if (item.status === "pending") {
            item.status = "aborted";
          }
        });
        queue = [];
      }
      function subscribe(callback, overwrite) {
        if (overwrite) {
          doneCallbacks = [];
        }
        if (typeof callback === "function") {
          doneCallbacks.push(callback);
        }
      }
      function getQueryStatus() {
        return {
          startTime,
          payload,
          status,
          queriesSent,
          queriesPending: queue.length,
          subscribe,
          abort
        };
      }
      function failQuery() {
        status = "failed";
        doneCallbacks.forEach((callback) => {
          callback(void 0, lastError);
        });
      }
      function clearQueue() {
        queue.forEach((item) => {
          if (item.status === "pending") {
            item.status = "aborted";
          }
        });
        queue = [];
      }
      function moduleResponse(item, response, data) {
        const isError = response !== "success";
        queue = queue.filter((queued) => queued !== item);
        switch (status) {
          case "pending":
            break;
          case "failed":
            if (isError || !config.dataAfterTimeout) {
              return;
            }
            break;
          default:
            return;
        }
        if (response === "abort") {
          lastError = data;
          failQuery();
          return;
        }
        if (isError) {
          lastError = data;
          if (!queue.length) {
            if (!resources.length) {
              failQuery();
            } else {
              execNext();
            }
          }
          return;
        }
        resetTimer();
        clearQueue();
        if (!config.random) {
          const index = config.resources.indexOf(item.resource);
          if (index !== -1 && index !== config.index) {
            config.index = index;
          }
        }
        status = "completed";
        doneCallbacks.forEach((callback) => {
          callback(data);
        });
      }
      function execNext() {
        if (status !== "pending") {
          return;
        }
        resetTimer();
        const resource = resources.shift();
        if (resource === void 0) {
          if (queue.length) {
            timer = setTimeout(() => {
              resetTimer();
              if (status === "pending") {
                clearQueue();
                failQuery();
              }
            }, config.timeout);
            return;
          }
          failQuery();
          return;
        }
        const item = {
          status: "pending",
          resource,
          callback: (status2, data) => {
            moduleResponse(item, status2, data);
          }
        };
        queue.push(item);
        queriesSent++;
        timer = setTimeout(execNext, config.rotate);
        query(resource, payload, item.callback);
      }
      setTimeout(execNext);
      return getQueryStatus;
    }

    // src/index.ts
    function initRedundancy(cfg) {
      const config = {
        ...defaultConfig,
        ...cfg
      };
      let queries = [];
      function cleanup() {
        queries = queries.filter((item) => item().status === "pending");
      }
      function query(payload, queryCallback, doneCallback) {
        const query2 = sendQuery(
          config,
          payload,
          queryCallback,
          (data, error) => {
            cleanup();
            if (doneCallback) {
              doneCallback(data, error);
            }
          }
        );
        queries.push(query2);
        return query2;
      }
      function find(callback) {
        return queries.find((value) => {
          return callback(value);
        }) || null;
      }
      const instance = {
        query,
        find,
        setIndex: (index) => {
          config.index = index;
        },
        getIndex: () => config.index,
        cleanup
      };
      return instance;
    }

    function emptyCallback$1() {
    }
    const redundancyCache = /* @__PURE__ */ Object.create(null);
    function getRedundancyCache(provider) {
      if (!redundancyCache[provider]) {
        const config = getAPIConfig(provider);
        if (!config) {
          return;
        }
        const redundancy = initRedundancy(config);
        const cachedReundancy = {
          config,
          redundancy
        };
        redundancyCache[provider] = cachedReundancy;
      }
      return redundancyCache[provider];
    }
    function sendAPIQuery(target, query, callback) {
      let redundancy;
      let send;
      if (typeof target === "string") {
        const api = getAPIModule(target);
        if (!api) {
          callback(void 0, 424);
          return emptyCallback$1;
        }
        send = api.send;
        const cached = getRedundancyCache(target);
        if (cached) {
          redundancy = cached.redundancy;
        }
      } else {
        const config = createAPIConfig(target);
        if (config) {
          redundancy = initRedundancy(config);
          const moduleKey = target.resources ? target.resources[0] : "";
          const api = getAPIModule(moduleKey);
          if (api) {
            send = api.send;
          }
        }
      }
      if (!redundancy || !send) {
        callback(void 0, 424);
        return emptyCallback$1;
      }
      return redundancy.query(query, send, callback)().abort;
    }

    const browserCacheVersion = "iconify2";
    const browserCachePrefix = "iconify";
    const browserCacheCountKey = browserCachePrefix + "-count";
    const browserCacheVersionKey = browserCachePrefix + "-version";
    const browserStorageHour = 36e5;
    const browserStorageCacheExpiration = 168;

    function getStoredItem(func, key) {
      try {
        return func.getItem(key);
      } catch (err) {
      }
    }
    function setStoredItem(func, key, value) {
      try {
        func.setItem(key, value);
        return true;
      } catch (err) {
      }
    }
    function removeStoredItem(func, key) {
      try {
        func.removeItem(key);
      } catch (err) {
      }
    }

    function setBrowserStorageItemsCount(storage, value) {
      return setStoredItem(storage, browserCacheCountKey, value.toString());
    }
    function getBrowserStorageItemsCount(storage) {
      return parseInt(getStoredItem(storage, browserCacheCountKey)) || 0;
    }

    const browserStorageConfig = {
      local: true,
      session: true
    };
    const browserStorageEmptyItems = {
      local: /* @__PURE__ */ new Set(),
      session: /* @__PURE__ */ new Set()
    };
    let browserStorageStatus = false;
    function setBrowserStorageStatus(status) {
      browserStorageStatus = status;
    }

    let _window = typeof window === "undefined" ? {} : window;
    function getBrowserStorage(key) {
      const attr = key + "Storage";
      try {
        if (_window && _window[attr] && typeof _window[attr].length === "number") {
          return _window[attr];
        }
      } catch (err) {
      }
      browserStorageConfig[key] = false;
    }

    function iterateBrowserStorage(key, callback) {
      const func = getBrowserStorage(key);
      if (!func) {
        return;
      }
      const version = getStoredItem(func, browserCacheVersionKey);
      if (version !== browserCacheVersion) {
        if (version) {
          const total2 = getBrowserStorageItemsCount(func);
          for (let i = 0; i < total2; i++) {
            removeStoredItem(func, browserCachePrefix + i.toString());
          }
        }
        setStoredItem(func, browserCacheVersionKey, browserCacheVersion);
        setBrowserStorageItemsCount(func, 0);
        return;
      }
      const minTime = Math.floor(Date.now() / browserStorageHour) - browserStorageCacheExpiration;
      const parseItem = (index) => {
        const name = browserCachePrefix + index.toString();
        const item = getStoredItem(func, name);
        if (typeof item !== "string") {
          return;
        }
        try {
          const data = JSON.parse(item);
          if (typeof data === "object" && typeof data.cached === "number" && data.cached > minTime && typeof data.provider === "string" && typeof data.data === "object" && typeof data.data.prefix === "string" && // Valid item: run callback
          callback(data, index)) {
            return true;
          }
        } catch (err) {
        }
        removeStoredItem(func, name);
      };
      let total = getBrowserStorageItemsCount(func);
      for (let i = total - 1; i >= 0; i--) {
        if (!parseItem(i)) {
          if (i === total - 1) {
            total--;
            setBrowserStorageItemsCount(func, total);
          } else {
            browserStorageEmptyItems[key].add(i);
          }
        }
      }
    }

    function initBrowserStorage() {
      if (browserStorageStatus) {
        return;
      }
      setBrowserStorageStatus(true);
      for (const key in browserStorageConfig) {
        iterateBrowserStorage(key, (item) => {
          const iconSet = item.data;
          const provider = item.provider;
          const prefix = iconSet.prefix;
          const storage = getStorage(
            provider,
            prefix
          );
          if (!addIconSet(storage, iconSet).length) {
            return false;
          }
          const lastModified = iconSet.lastModified || -1;
          storage.lastModifiedCached = storage.lastModifiedCached ? Math.min(storage.lastModifiedCached, lastModified) : lastModified;
          return true;
        });
      }
    }

    function updateLastModified(storage, lastModified) {
      const lastValue = storage.lastModifiedCached;
      if (
        // Matches or newer
        lastValue && lastValue >= lastModified
      ) {
        return lastValue === lastModified;
      }
      storage.lastModifiedCached = lastModified;
      if (lastValue) {
        for (const key in browserStorageConfig) {
          iterateBrowserStorage(key, (item) => {
            const iconSet = item.data;
            return item.provider !== storage.provider || iconSet.prefix !== storage.prefix || iconSet.lastModified === lastModified;
          });
        }
      }
      return true;
    }
    function storeInBrowserStorage(storage, data) {
      if (!browserStorageStatus) {
        initBrowserStorage();
      }
      function store(key) {
        let func;
        if (!browserStorageConfig[key] || !(func = getBrowserStorage(key))) {
          return;
        }
        const set = browserStorageEmptyItems[key];
        let index;
        if (set.size) {
          set.delete(index = Array.from(set).shift());
        } else {
          index = getBrowserStorageItemsCount(func);
          if (!setBrowserStorageItemsCount(func, index + 1)) {
            return;
          }
        }
        const item = {
          cached: Math.floor(Date.now() / browserStorageHour),
          provider: storage.provider,
          data
        };
        return setStoredItem(
          func,
          browserCachePrefix + index.toString(),
          JSON.stringify(item)
        );
      }
      if (data.lastModified && !updateLastModified(storage, data.lastModified)) {
        return;
      }
      if (!Object.keys(data.icons).length) {
        return;
      }
      if (data.not_found) {
        data = Object.assign({}, data);
        delete data.not_found;
      }
      if (!store("local")) {
        store("session");
      }
    }

    function emptyCallback() {
    }
    function loadedNewIcons(storage) {
      if (!storage.iconsLoaderFlag) {
        storage.iconsLoaderFlag = true;
        setTimeout(() => {
          storage.iconsLoaderFlag = false;
          updateCallbacks(storage);
        });
      }
    }
    function loadNewIcons(storage, icons) {
      if (!storage.iconsToLoad) {
        storage.iconsToLoad = icons;
      } else {
        storage.iconsToLoad = storage.iconsToLoad.concat(icons).sort();
      }
      if (!storage.iconsQueueFlag) {
        storage.iconsQueueFlag = true;
        setTimeout(() => {
          storage.iconsQueueFlag = false;
          const { provider, prefix } = storage;
          const icons2 = storage.iconsToLoad;
          delete storage.iconsToLoad;
          let api;
          if (!icons2 || !(api = getAPIModule(provider))) {
            return;
          }
          const params = api.prepare(provider, prefix, icons2);
          params.forEach((item) => {
            sendAPIQuery(provider, item, (data) => {
              if (typeof data !== "object") {
                item.icons.forEach((name) => {
                  storage.missing.add(name);
                });
              } else {
                try {
                  const parsed = addIconSet(
                    storage,
                    data
                  );
                  if (!parsed.length) {
                    return;
                  }
                  const pending = storage.pendingIcons;
                  if (pending) {
                    parsed.forEach((name) => {
                      pending.delete(name);
                    });
                  }
                  storeInBrowserStorage(storage, data);
                } catch (err) {
                  console.error(err);
                }
              }
              loadedNewIcons(storage);
            });
          });
        });
      }
    }
    const loadIcons = (icons, callback) => {
      const cleanedIcons = listToIcons(icons, true, allowSimpleNames());
      const sortedIcons = sortIcons(cleanedIcons);
      if (!sortedIcons.pending.length) {
        let callCallback = true;
        if (callback) {
          setTimeout(() => {
            if (callCallback) {
              callback(
                sortedIcons.loaded,
                sortedIcons.missing,
                sortedIcons.pending,
                emptyCallback
              );
            }
          });
        }
        return () => {
          callCallback = false;
        };
      }
      const newIcons = /* @__PURE__ */ Object.create(null);
      const sources = [];
      let lastProvider, lastPrefix;
      sortedIcons.pending.forEach((icon) => {
        const { provider, prefix } = icon;
        if (prefix === lastPrefix && provider === lastProvider) {
          return;
        }
        lastProvider = provider;
        lastPrefix = prefix;
        sources.push(getStorage(provider, prefix));
        const providerNewIcons = newIcons[provider] || (newIcons[provider] = /* @__PURE__ */ Object.create(null));
        if (!providerNewIcons[prefix]) {
          providerNewIcons[prefix] = [];
        }
      });
      sortedIcons.pending.forEach((icon) => {
        const { provider, prefix, name } = icon;
        const storage = getStorage(provider, prefix);
        const pendingQueue = storage.pendingIcons || (storage.pendingIcons = /* @__PURE__ */ new Set());
        if (!pendingQueue.has(name)) {
          pendingQueue.add(name);
          newIcons[provider][prefix].push(name);
        }
      });
      sources.forEach((storage) => {
        const { provider, prefix } = storage;
        if (newIcons[provider][prefix].length) {
          loadNewIcons(storage, newIcons[provider][prefix]);
        }
      });
      return callback ? storeCallback(callback, sortedIcons, sources) : emptyCallback;
    };
    const loadIcon = (icon) => {
      return new Promise((fulfill, reject) => {
        const iconObj = typeof icon === "string" ? stringToIcon(icon, true) : icon;
        if (!iconObj) {
          reject(icon);
          return;
        }
        loadIcons([iconObj || icon], (loaded) => {
          if (loaded.length && iconObj) {
            const data = getIconData(iconObj);
            if (data) {
              fulfill({
                ...defaultIconProps,
                ...data
              });
              return;
            }
          }
          reject(icon);
        });
      });
    };

    function toggleBrowserCache(storage, value) {
      switch (storage) {
        case "local":
        case "session":
          browserStorageConfig[storage] = value;
          break;
        case "all":
          for (const key in browserStorageConfig) {
            browserStorageConfig[key] = value;
          }
          break;
      }
    }

    function mergeCustomisations(defaults, item) {
      const result = {
        ...defaults
      };
      for (const key in item) {
        const value = item[key];
        const valueType = typeof value;
        if (key in defaultIconSizeCustomisations) {
          if (value === null || value && (valueType === "string" || valueType === "number")) {
            result[key] = value;
          }
        } else if (valueType === typeof result[key]) {
          result[key] = key === "rotate" ? value % 4 : value;
        }
      }
      return result;
    }

    const separator = /[\s,]+/;
    function flipFromString(custom, flip) {
      flip.split(separator).forEach((str) => {
        const value = str.trim();
        switch (value) {
          case "horizontal":
            custom.hFlip = true;
            break;
          case "vertical":
            custom.vFlip = true;
            break;
        }
      });
    }

    function rotateFromString(value, defaultValue = 0) {
      const units = value.replace(/^-?[0-9.]*/, "");
      function cleanup(value2) {
        while (value2 < 0) {
          value2 += 4;
        }
        return value2 % 4;
      }
      if (units === "") {
        const num = parseInt(value);
        return isNaN(num) ? 0 : cleanup(num);
      } else if (units !== value) {
        let split = 0;
        switch (units) {
          case "%":
            split = 25;
            break;
          case "deg":
            split = 90;
        }
        if (split) {
          let num = parseFloat(value.slice(0, value.length - units.length));
          if (isNaN(num)) {
            return 0;
          }
          num = num / split;
          return num % 1 === 0 ? cleanup(num) : 0;
        }
      }
      return defaultValue;
    }

    function iconToHTML(body, attributes) {
      let renderAttribsHTML = body.indexOf("xlink:") === -1 ? "" : ' xmlns:xlink="http://www.w3.org/1999/xlink"';
      for (const attr in attributes) {
        renderAttribsHTML += " " + attr + '="' + attributes[attr] + '"';
      }
      return '<svg xmlns="http://www.w3.org/2000/svg"' + renderAttribsHTML + ">" + body + "</svg>";
    }

    function encodeSVGforURL(svg) {
      return svg.replace(/"/g, "'").replace(/%/g, "%25").replace(/#/g, "%23").replace(/</g, "%3C").replace(/>/g, "%3E").replace(/\s+/g, " ");
    }
    function svgToData(svg) {
      return "data:image/svg+xml," + encodeSVGforURL(svg);
    }
    function svgToURL(svg) {
      return 'url("' + svgToData(svg) + '")';
    }

    const defaultExtendedIconCustomisations = {
        ...defaultIconCustomisations,
        inline: false,
    };

    /**
     * Default SVG attributes
     */
    const svgDefaults = {
        'xmlns': 'http://www.w3.org/2000/svg',
        'xmlns:xlink': 'http://www.w3.org/1999/xlink',
        'aria-hidden': true,
        'role': 'img',
    };
    /**
     * Style modes
     */
    const commonProps = {
        display: 'inline-block',
    };
    const monotoneProps = {
        'background-color': 'currentColor',
    };
    const coloredProps = {
        'background-color': 'transparent',
    };
    // Dynamically add common props to variables above
    const propsToAdd = {
        image: 'var(--svg)',
        repeat: 'no-repeat',
        size: '100% 100%',
    };
    const propsToAddTo = {
        '-webkit-mask': monotoneProps,
        'mask': monotoneProps,
        'background': coloredProps,
    };
    for (const prefix in propsToAddTo) {
        const list = propsToAddTo[prefix];
        for (const prop in propsToAdd) {
            list[prefix + '-' + prop] = propsToAdd[prop];
        }
    }
    /**
     * Fix size: add 'px' to numbers
     */
    function fixSize(value) {
        return value + (value.match(/^[-0-9.]+$/) ? 'px' : '');
    }
    /**
     * Generate icon from properties
     */
    function render(
    // Icon must be validated before calling this function
    icon, 
    // Properties
    props) {
        const customisations = mergeCustomisations(defaultExtendedIconCustomisations, props);
        // Check mode
        const mode = props.mode || 'svg';
        const componentProps = (mode === 'svg' ? { ...svgDefaults } : {});
        if (icon.body.indexOf('xlink:') === -1) {
            delete componentProps['xmlns:xlink'];
        }
        // Create style if missing
        let style = typeof props.style === 'string' ? props.style : '';
        // Get element properties
        for (let key in props) {
            const value = props[key];
            if (value === void 0) {
                continue;
            }
            switch (key) {
                // Properties to ignore
                case 'icon':
                case 'style':
                case 'onLoad':
                case 'mode':
                    break;
                // Boolean attributes
                case 'inline':
                case 'hFlip':
                case 'vFlip':
                    customisations[key] =
                        value === true || value === 'true' || value === 1;
                    break;
                // Flip as string: 'horizontal,vertical'
                case 'flip':
                    if (typeof value === 'string') {
                        flipFromString(customisations, value);
                    }
                    break;
                // Color: copy to style, add extra ';' in case style is missing it
                case 'color':
                    style =
                        style +
                            (style.length > 0 && style.trim().slice(-1) !== ';'
                                ? ';'
                                : '') +
                            'color: ' +
                            value +
                            '; ';
                    break;
                // Rotation as string
                case 'rotate':
                    if (typeof value === 'string') {
                        customisations[key] = rotateFromString(value);
                    }
                    else if (typeof value === 'number') {
                        customisations[key] = value;
                    }
                    break;
                // Remove aria-hidden
                case 'ariaHidden':
                case 'aria-hidden':
                    if (value !== true && value !== 'true') {
                        delete componentProps['aria-hidden'];
                    }
                    break;
                default:
                    if (key.slice(0, 3) === 'on:') {
                        // Svelte event
                        break;
                    }
                    // Copy missing property if it does not exist in customisations
                    if (defaultExtendedIconCustomisations[key] === void 0) {
                        componentProps[key] = value;
                    }
            }
        }
        // Generate icon
        const item = iconToSVG(icon, customisations);
        const renderAttribs = item.attributes;
        // Inline display
        if (customisations.inline) {
            // Style overrides it
            style = 'vertical-align: -0.125em; ' + style;
        }
        if (mode === 'svg') {
            // Add icon stuff
            Object.assign(componentProps, renderAttribs);
            // Style
            if (style !== '') {
                componentProps.style = style;
            }
            // Counter for ids based on "id" property to render icons consistently on server and client
            let localCounter = 0;
            let id = props.id;
            if (typeof id === 'string') {
                // Convert '-' to '_' to avoid errors in animations
                id = id.replace(/-/g, '_');
            }
            // Generate HTML
            return {
                svg: true,
                attributes: componentProps,
                body: replaceIDs(item.body, id ? () => id + 'ID' + localCounter++ : 'iconifySvelte'),
            };
        }
        // Render <span> with style
        const { body, width, height } = icon;
        const useMask = mode === 'mask' ||
            (mode === 'bg' ? false : body.indexOf('currentColor') !== -1);
        // Generate SVG
        const html = iconToHTML(body, {
            ...renderAttribs,
            width: width + '',
            height: height + '',
        });
        // Generate style
        const url = svgToURL(html);
        const styles = {
            '--svg': url,
        };
        const size = (prop) => {
            const value = renderAttribs[prop];
            if (value) {
                styles[prop] = fixSize(value);
            }
        };
        size('width');
        size('height');
        Object.assign(styles, commonProps, useMask ? monotoneProps : coloredProps);
        let customStyle = '';
        for (const key in styles) {
            customStyle += key + ': ' + styles[key] + ';';
        }
        componentProps.style = customStyle + style;
        return {
            svg: false,
            attributes: componentProps,
        };
    }

    /**
     * Enable cache
     */
    function enableCache(storage) {
        toggleBrowserCache(storage, true);
    }
    /**
     * Disable cache
     */
    function disableCache(storage) {
        toggleBrowserCache(storage, false);
    }
    /**
     * Initialise stuff
     */
    // Enable short names
    allowSimpleNames(true);
    // Set API module
    setAPIModule('', fetchAPIModule);
    /**
     * Browser stuff
     */
    if (typeof document !== 'undefined' && typeof window !== 'undefined') {
        // Set cache and load existing cache
        initBrowserStorage();
        const _window = window;
        // Load icons from global "IconifyPreload"
        if (_window.IconifyPreload !== void 0) {
            const preload = _window.IconifyPreload;
            const err = 'Invalid IconifyPreload syntax.';
            if (typeof preload === 'object' && preload !== null) {
                (preload instanceof Array ? preload : [preload]).forEach((item) => {
                    try {
                        if (
                        // Check if item is an object and not null/array
                        typeof item !== 'object' ||
                            item === null ||
                            item instanceof Array ||
                            // Check for 'icons' and 'prefix'
                            typeof item.icons !== 'object' ||
                            typeof item.prefix !== 'string' ||
                            // Add icon set
                            !addCollection(item)) {
                            console.error(err);
                        }
                    }
                    catch (e) {
                        console.error(err);
                    }
                });
            }
        }
        // Set API from global "IconifyProviders"
        if (_window.IconifyProviders !== void 0) {
            const providers = _window.IconifyProviders;
            if (typeof providers === 'object' && providers !== null) {
                for (let key in providers) {
                    const err = 'IconifyProviders[' + key + '] is invalid.';
                    try {
                        const value = providers[key];
                        if (typeof value !== 'object' ||
                            !value ||
                            value.resources === void 0) {
                            continue;
                        }
                        if (!addAPIProvider(key, value)) {
                            console.error(err);
                        }
                    }
                    catch (e) {
                        console.error(err);
                    }
                }
            }
        }
    }
    /**
     * Check if component needs to be updated
     */
    function checkIconState(icon, state, mounted, callback, onload) {
        // Abort loading icon
        function abortLoading() {
            if (state.loading) {
                state.loading.abort();
                state.loading = null;
            }
        }
        // Icon is an object
        if (typeof icon === 'object' &&
            icon !== null &&
            typeof icon.body === 'string') {
            // Stop loading
            state.name = '';
            abortLoading();
            return { data: { ...defaultIconProps, ...icon } };
        }
        // Invalid icon?
        let iconName;
        if (typeof icon !== 'string' ||
            (iconName = stringToIcon(icon, false, true)) === null) {
            abortLoading();
            return null;
        }
        // Load icon
        const data = getIconData(iconName);
        if (!data) {
            // Icon data is not available
            // Do not load icon until component is mounted
            if (mounted && (!state.loading || state.loading.name !== icon)) {
                // New icon to load
                abortLoading();
                state.name = '';
                state.loading = {
                    name: icon,
                    abort: loadIcons([iconName], callback),
                };
            }
            return null;
        }
        // Icon data is available
        abortLoading();
        if (state.name !== icon) {
            state.name = icon;
            if (onload && !state.destroyed) {
                onload(icon);
            }
        }
        // Add classes
        const classes = ['iconify'];
        if (iconName.prefix !== '') {
            classes.push('iconify--' + iconName.prefix);
        }
        if (iconName.provider !== '') {
            classes.push('iconify--' + iconName.provider);
        }
        return { data, classes };
    }
    /**
     * Generate icon
     */
    function generateIcon(icon, props) {
        return icon
            ? render({
                ...defaultIconProps,
                ...icon,
            }, props)
            : null;
    }
    /**
     * Internal API
     */
    const _api = {
        getAPIConfig,
        setAPIModule,
        sendAPIQuery,
        setFetch,
        getFetch,
        listAPIProviders,
    };

    /* node_modules\@iconify\svelte\dist\Icon.svelte generated by Svelte v3.44.1 */
    const file$1 = "node_modules\\@iconify\\svelte\\dist\\Icon.svelte";

    // (108:0) {#if data}
    function create_if_block(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*data*/ ctx[0].svg) return create_if_block_1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(108:0) {#if data}",
    		ctx
    	});

    	return block;
    }

    // (113:1) {:else}
    function create_else_block(ctx) {
    	let span;
    	let span_levels = [/*data*/ ctx[0].attributes];
    	let span_data = {};

    	for (let i = 0; i < span_levels.length; i += 1) {
    		span_data = assign(span_data, span_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			span = element("span");
    			set_attributes(span, span_data);
    			add_location(span, file$1, 113, 2, 2001);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(span, span_data = get_spread_update(span_levels, [dirty & /*data*/ 1 && /*data*/ ctx[0].attributes]));
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(113:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (109:1) {#if data.svg}
    function create_if_block_1(ctx) {
    	let svg;
    	let raw_value = /*data*/ ctx[0].body + "";
    	let svg_levels = [/*data*/ ctx[0].attributes];
    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			set_svg_attributes(svg, svg_data);
    			add_location(svg, file$1, 109, 2, 1933);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			svg.innerHTML = raw_value;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 1 && raw_value !== (raw_value = /*data*/ ctx[0].body + "")) svg.innerHTML = raw_value;			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [dirty & /*data*/ 1 && /*data*/ ctx[0].attributes]));
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(109:1) {#if data.svg}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let if_block_anchor;
    	let if_block = /*data*/ ctx[0] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*data*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Icon', slots, []);

    	const state = {
    		// Last icon name
    		name: '',
    		// Loading status
    		loading: null,
    		// Destroyed status
    		destroyed: false
    	};

    	// Mounted status
    	let mounted = false;

    	// Callback counter
    	let counter = 0;

    	// Generated data
    	let data;

    	const onLoad = icon => {
    		// Legacy onLoad property
    		if (typeof $$props.onLoad === 'function') {
    			$$props.onLoad(icon);
    		}

    		// on:load event
    		const dispatch = createEventDispatcher();

    		dispatch('load', { icon });
    	};

    	// Increase counter when loaded to force re-calculation of data
    	function loaded() {
    		$$invalidate(3, counter++, counter);
    	}

    	// Force re-render
    	onMount(() => {
    		$$invalidate(2, mounted = true);
    	});

    	// Abort loading when component is destroyed
    	onDestroy(() => {
    		$$invalidate(1, state.destroyed = true, state);

    		if (state.loading) {
    			state.loading.abort();
    			$$invalidate(1, state.loading = null, state);
    		}
    	});

    	$$self.$$set = $$new_props => {
    		$$invalidate(6, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$capture_state = () => ({
    		enableCache,
    		disableCache,
    		iconExists,
    		getIcon,
    		listIcons,
    		addIcon,
    		addCollection,
    		calculateSize,
    		replaceIDs,
    		buildIcon: iconToSVG,
    		loadIcons,
    		loadIcon,
    		addAPIProvider,
    		_api,
    		onMount,
    		onDestroy,
    		createEventDispatcher,
    		checkIconState,
    		generateIcon,
    		state,
    		mounted,
    		counter,
    		data,
    		onLoad,
    		loaded
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(6, $$props = assign(assign({}, $$props), $$new_props));
    		if ('mounted' in $$props) $$invalidate(2, mounted = $$new_props.mounted);
    		if ('counter' in $$props) $$invalidate(3, counter = $$new_props.counter);
    		if ('data' in $$props) $$invalidate(0, data = $$new_props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		 {
    			const iconData = checkIconState($$props.icon, state, mounted, loaded, onLoad);
    			$$invalidate(0, data = iconData ? generateIcon(iconData.data, $$props) : null);

    			if (data && iconData.classes) {
    				// Add classes
    				$$invalidate(
    					0,
    					data.attributes['class'] = (typeof $$props['class'] === 'string'
    					? $$props['class'] + ' '
    					: '') + iconData.classes.join(' '),
    					data
    				);
    			}
    		}
    	};

    	$$props = exclude_internal_props($$props);
    	return [data, state, mounted, counter];
    }

    class Icon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Icon",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\layout\UHCFooter.svelte generated by Svelte v3.44.1 */
    const file$2 = "src\\layout\\UHCFooter.svelte";

    function create_fragment$2(ctx) {
    	let footer;
    	let div13;
    	let div11;
    	let div2;
    	let a0;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div1;
    	let ul;
    	let li0;
    	let a1;
    	let t1;
    	let t2;
    	let li1;
    	let a2;
    	let t3;
    	let t4;
    	let div10;
    	let t5;
    	let div9;
    	let a3;
    	let div3;
    	let icon0;
    	let t6;
    	let a4;
    	let div4;
    	let icon1;
    	let t7;
    	let a5;
    	let div5;
    	let icon2;
    	let t8;
    	let a6;
    	let div6;
    	let icon3;
    	let t9;
    	let a7;
    	let div7;
    	let icon4;
    	let t10;
    	let a8;
    	let div8;
    	let icon5;
    	let t11;
    	let hr;
    	let t12;
    	let div12;
    	let t13;
    	let a9;
    	let t14;
    	let t15;
    	let a10;
    	let t16;
    	let t17;
    	let current;

    	icon0 = new Icon({
    			props: { icon: "mdi:github" },
    			$$inline: true
    		});

    	icon1 = new Icon({
    			props: { icon: "il:facebook" },
    			$$inline: true
    		});

    	icon2 = new Icon({
    			props: { icon: "mdi:twitter" },
    			$$inline: true
    		});

    	icon3 = new Icon({
    			props: { icon: "mdi:instagram" },
    			$$inline: true
    		});

    	icon4 = new Icon({
    			props: { icon: "mdi:youtube" },
    			$$inline: true
    		});

    	icon5 = new Icon({
    			props: { icon: "mdi:linkedin" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			div13 = element("div");
    			div11 = element("div");
    			div2 = element("div");
    			a0 = element("a");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			ul = element("ul");
    			li0 = element("li");
    			a1 = element("a");
    			t1 = text("Contact us");
    			t2 = space();
    			li1 = element("li");
    			a2 = element("a");
    			t3 = text("Privacy and legal");
    			t4 = space();
    			div10 = element("div");
    			t5 = text("Follow UHC:\r\n        ");
    			div9 = element("div");
    			a3 = element("a");
    			div3 = element("div");
    			create_component(icon0.$$.fragment);
    			t6 = space();
    			a4 = element("a");
    			div4 = element("div");
    			create_component(icon1.$$.fragment);
    			t7 = space();
    			a5 = element("a");
    			div5 = element("div");
    			create_component(icon2.$$.fragment);
    			t8 = space();
    			a6 = element("a");
    			div6 = element("div");
    			create_component(icon3.$$.fragment);
    			t9 = space();
    			a7 = element("a");
    			div7 = element("div");
    			create_component(icon4.$$.fragment);
    			t10 = space();
    			a8 = element("a");
    			div8 = element("div");
    			create_component(icon5.$$.fragment);
    			t11 = space();
    			hr = element("hr");
    			t12 = space();
    			div12 = element("div");
    			t13 = text("This template was forked and modified from the ");
    			a9 = element("a");
    			t14 = text("UK Office of National Statistics");
    			t15 = text(". All content is available under the\r\n      ");
    			a10 = element("a");
    			t16 = text("MIT License");
    			t17 = text(", except where otherwise stated");
    			attr_dev(img, "id", "my-svg");
    			if (!src_url_equal(img.src, img_src_value = "./img/uhc-primary-blue_black.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Drexel Urban Health Collaborative");
    			attr_dev(img, "class", "svelte-jjyrck");
    			add_location(img, file$2, 17, 12, 492);
    			attr_dev(div0, "id", "svg-container");
    			attr_dev(div0, "class", "svelte-jjyrck");
    			add_location(div0, file$2, 16, 10, 454);
    			attr_dev(a0, "href", "https://drexel.edu/uhc/");
    			attr_dev(a0, "class", "svelte-jjyrck");
    			add_location(a0, file$2, 15, 8, 408);
    			attr_dev(a1, "href", "https://drexel.edu/uhc/about/contact/");
    			attr_dev(a1, "class", "link svelte-jjyrck");
    			set_style(a1, "color", themes[/*theme*/ ctx[0]]['text']);
    			add_location(a1, file$2, 27, 14, 763);
    			attr_dev(li0, "class", "svelte-jjyrck");
    			add_location(li0, file$2, 26, 12, 743);
    			attr_dev(a2, "href", "https://drexel.edu/privacy");
    			attr_dev(a2, "class", "link svelte-jjyrck");
    			set_style(a2, "color", themes[/*theme*/ ctx[0]]['text']);
    			add_location(a2, file$2, 35, 14, 999);
    			attr_dev(li1, "class", "svelte-jjyrck");
    			add_location(li1, file$2, 34, 12, 979);
    			attr_dev(ul, "class", "svelte-jjyrck");
    			add_location(ul, file$2, 25, 10, 725);
    			attr_dev(div1, "class", "link-tree svelte-jjyrck");
    			add_location(div1, file$2, 24, 8, 690);
    			attr_dev(div2, "class", "item svelte-jjyrck");
    			add_location(div2, file$2, 14, 6, 380);
    			attr_dev(div3, "class", "social-icon svelte-jjyrck");
    			add_location(div3, file$2, 48, 12, 1404);
    			attr_dev(a3, "href", "https://github.com/Drexel-UHC");
    			add_location(a3, file$2, 47, 10, 1350);
    			attr_dev(div4, "class", "social-icon svelte-jjyrck");
    			add_location(div4, file$2, 51, 12, 1549);
    			attr_dev(a4, "href", "https://www.facebook.com/DrexelUHC/");
    			add_location(a4, file$2, 50, 10, 1489);
    			attr_dev(div5, "class", "social-icon svelte-jjyrck");
    			add_location(div5, file$2, 54, 12, 1689);
    			attr_dev(a5, "href", "https://twitter.com/drexeluhc");
    			add_location(a5, file$2, 53, 10, 1635);
    			attr_dev(div6, "class", "social-icon svelte-jjyrck");
    			add_location(div6, file$2, 57, 12, 1835);
    			attr_dev(a6, "href", "https://www.instagram.com/drexeluhc");
    			add_location(a6, file$2, 56, 10, 1775);
    			attr_dev(div7, "class", "social-icon svelte-jjyrck");
    			add_location(div7, file$2, 60, 12, 2001);
    			attr_dev(a7, "href", "https://www.youtube.com/@urbanhealthcollaborative8928");
    			add_location(a7, file$2, 59, 10, 1923);
    			attr_dev(div8, "class", "social-icon svelte-jjyrck");
    			add_location(div8, file$2, 65, 12, 2204);
    			attr_dev(a8, "href", "https://www.linkedin.com/company/drexel-urban-health-collaborative/");
    			add_location(a8, file$2, 62, 10, 2087);
    			attr_dev(div9, "class", "container svelte-jjyrck");
    			add_location(div9, file$2, 46, 8, 1315);
    			attr_dev(div10, "class", "item svelte-jjyrck");
    			attr_dev(div10, "id", "follow-uhc");
    			add_location(div10, file$2, 44, 6, 1250);
    			attr_dev(div11, "class", "container svelte-jjyrck");
    			add_location(div11, file$2, 13, 4, 349);
    			set_style(hr, "border-top-color", themes[/*theme*/ ctx[0]]['muted']);
    			attr_dev(hr, "class", "svelte-jjyrck");
    			add_location(hr, file$2, 70, 4, 2327);
    			attr_dev(a9, "href", "https://github.com/ONSvisual/svelte-scrolly");
    			attr_dev(a9, "class", "link svelte-jjyrck");
    			attr_dev(a9, "target", "_blank");
    			attr_dev(a9, "rel", "noopener");
    			set_style(a9, "color", themes[/*theme*/ ctx[0]]['text']);
    			add_location(a9, file$2, 72, 53, 2466);
    			attr_dev(a10, "href", "https://opensource.org/licenses/MIT");
    			attr_dev(a10, "class", "link svelte-jjyrck");
    			attr_dev(a10, "target", "_blank");
    			attr_dev(a10, "rel", "noopener");
    			set_style(a10, "color", themes[/*theme*/ ctx[0]]['text']);
    			add_location(a10, file$2, 80, 6, 2746);
    			attr_dev(div12, "class", "license svelte-jjyrck");
    			add_location(div12, file$2, 71, 4, 2390);
    			attr_dev(div13, "class", "col-wide");
    			attr_dev(div13, "data-analytics", "footer");
    			add_location(div13, file$2, 12, 2, 297);
    			set_style(footer, "color", themes[/*theme*/ ctx[0]]['text']);
    			set_style(footer, "background-color", themes[/*theme*/ ctx[0]]['pale']);
    			attr_dev(footer, "class", "svelte-jjyrck");
    			add_location(footer, file$2, 7, 0, 187);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, div13);
    			append_dev(div13, div11);
    			append_dev(div11, div2);
    			append_dev(div2, a0);
    			append_dev(a0, div0);
    			append_dev(div0, img);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, ul);
    			append_dev(ul, li0);
    			append_dev(li0, a1);
    			append_dev(a1, t1);
    			append_dev(ul, t2);
    			append_dev(ul, li1);
    			append_dev(li1, a2);
    			append_dev(a2, t3);
    			append_dev(div11, t4);
    			append_dev(div11, div10);
    			append_dev(div10, t5);
    			append_dev(div10, div9);
    			append_dev(div9, a3);
    			append_dev(a3, div3);
    			mount_component(icon0, div3, null);
    			append_dev(div9, t6);
    			append_dev(div9, a4);
    			append_dev(a4, div4);
    			mount_component(icon1, div4, null);
    			append_dev(div9, t7);
    			append_dev(div9, a5);
    			append_dev(a5, div5);
    			mount_component(icon2, div5, null);
    			append_dev(div9, t8);
    			append_dev(div9, a6);
    			append_dev(a6, div6);
    			mount_component(icon3, div6, null);
    			append_dev(div9, t9);
    			append_dev(div9, a7);
    			append_dev(a7, div7);
    			mount_component(icon4, div7, null);
    			append_dev(div9, t10);
    			append_dev(div9, a8);
    			append_dev(a8, div8);
    			mount_component(icon5, div8, null);
    			append_dev(div13, t11);
    			append_dev(div13, hr);
    			append_dev(div13, t12);
    			append_dev(div13, div12);
    			append_dev(div12, t13);
    			append_dev(div12, a9);
    			append_dev(a9, t14);
    			append_dev(div12, t15);
    			append_dev(div12, a10);
    			append_dev(a10, t16);
    			append_dev(div12, t17);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*theme*/ 1) {
    				set_style(a1, "color", themes[/*theme*/ ctx[0]]['text']);
    			}

    			if (!current || dirty & /*theme*/ 1) {
    				set_style(a2, "color", themes[/*theme*/ ctx[0]]['text']);
    			}

    			if (!current || dirty & /*theme*/ 1) {
    				set_style(hr, "border-top-color", themes[/*theme*/ ctx[0]]['muted']);
    			}

    			if (!current || dirty & /*theme*/ 1) {
    				set_style(a9, "color", themes[/*theme*/ ctx[0]]['text']);
    			}

    			if (!current || dirty & /*theme*/ 1) {
    				set_style(a10, "color", themes[/*theme*/ ctx[0]]['text']);
    			}

    			if (!current || dirty & /*theme*/ 1) {
    				set_style(footer, "color", themes[/*theme*/ ctx[0]]['text']);
    			}

    			if (!current || dirty & /*theme*/ 1) {
    				set_style(footer, "background-color", themes[/*theme*/ ctx[0]]['pale']);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon0.$$.fragment, local);
    			transition_in(icon1.$$.fragment, local);
    			transition_in(icon2.$$.fragment, local);
    			transition_in(icon3.$$.fragment, local);
    			transition_in(icon4.$$.fragment, local);
    			transition_in(icon5.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon0.$$.fragment, local);
    			transition_out(icon1.$$.fragment, local);
    			transition_out(icon2.$$.fragment, local);
    			transition_out(icon3.$$.fragment, local);
    			transition_out(icon4.$$.fragment, local);
    			transition_out(icon5.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    			destroy_component(icon0);
    			destroy_component(icon1);
    			destroy_component(icon2);
    			destroy_component(icon3);
    			destroy_component(icon4);
    			destroy_component(icon5);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('UHCFooter', slots, []);
    	let { theme = getContext('theme') } = $$props;
    	const writable_props = ['theme'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<UHCFooter> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('theme' in $$props) $$invalidate(0, theme = $$props.theme);
    	};

    	$$self.$capture_state = () => ({ themes, getContext, Icon, theme });

    	$$self.$inject_state = $$props => {
    		if ('theme' in $$props) $$invalidate(0, theme = $$props.theme);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [theme];
    }

    class UHCFooter extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { theme: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "UHCFooter",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get theme() {
    		throw new Error("<UHCFooter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set theme(value) {
    		throw new Error("<UHCFooter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\layout\Header.svelte generated by Svelte v3.44.1 */
    const file$3 = "src\\layout\\Header.svelte";

    function create_fragment$3(ctx) {
    	let header;
    	let div1;
    	let div0;
    	let header_style_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[8].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], null);

    	const block = {
    		c: function create() {
    			header = element("header");
    			div1 = element("div");
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			toggle_class(div0, "center", /*center*/ ctx[2]);
    			add_location(div0, file$3, 36, 4, 816);
    			attr_dev(div1, "class", "v-padded col-wide middle svelte-14xpfcj");
    			set_style(div1, "position", "relative");
    			toggle_class(div1, "short", /*short*/ ctx[3]);
    			toggle_class(div1, "height-full", !/*short*/ ctx[3]);
    			add_location(div1, file$3, 30, 2, 682);

    			attr_dev(header, "style", header_style_value = "color: " + themes[/*theme*/ ctx[0]]['text'] + "; background-color: " + (/*bgcolor*/ ctx[1]
    			? /*bgcolor*/ ctx[1]
    			: themes[/*theme*/ ctx[0]]['background']) + "; " + /*style*/ ctx[4]);

    			attr_dev(header, "class", "svelte-14xpfcj");
    			toggle_class(header, "short", /*short*/ ctx[3]);
    			add_location(header, file$3, 24, 0, 523);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, div1);
    			append_dev(div1, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 128)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[7],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[7])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[7], dirty, null),
    						null
    					);
    				}
    			}

    			if (dirty & /*center*/ 4) {
    				toggle_class(div0, "center", /*center*/ ctx[2]);
    			}

    			if (dirty & /*short*/ 8) {
    				toggle_class(div1, "short", /*short*/ ctx[3]);
    			}

    			if (dirty & /*short*/ 8) {
    				toggle_class(div1, "height-full", !/*short*/ ctx[3]);
    			}

    			if (!current || dirty & /*theme, bgcolor, style*/ 19 && header_style_value !== (header_style_value = "color: " + themes[/*theme*/ ctx[0]]['text'] + "; background-color: " + (/*bgcolor*/ ctx[1]
    			? /*bgcolor*/ ctx[1]
    			: themes[/*theme*/ ctx[0]]['background']) + "; " + /*style*/ ctx[4])) {
    				attr_dev(header, "style", header_style_value);
    			}

    			if (dirty & /*short*/ 8) {
    				toggle_class(header, "short", /*short*/ ctx[3]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Header', slots, ['default']);
    	let { theme = getContext('theme') } = $$props;
    	let { bgimage = null } = $$props;
    	let { bgcolor = null } = $$props;
    	let { bgfixed = false } = $$props;
    	let { center = true } = $$props;
    	let { short = false } = $$props;
    	let style = '';

    	if (bgimage) {
    		style += `background-image: url(${bgimage});`;
    	} else {
    		style += 'background-image: none;';
    	}

    	if (bgfixed) {
    		style += ' background-attachment: fixed;';
    	}

    	const writable_props = ['theme', 'bgimage', 'bgcolor', 'bgfixed', 'center', 'short'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('theme' in $$props) $$invalidate(0, theme = $$props.theme);
    		if ('bgimage' in $$props) $$invalidate(5, bgimage = $$props.bgimage);
    		if ('bgcolor' in $$props) $$invalidate(1, bgcolor = $$props.bgcolor);
    		if ('bgfixed' in $$props) $$invalidate(6, bgfixed = $$props.bgfixed);
    		if ('center' in $$props) $$invalidate(2, center = $$props.center);
    		if ('short' in $$props) $$invalidate(3, short = $$props.short);
    		if ('$$scope' in $$props) $$invalidate(7, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		themes,
    		getContext,
    		theme,
    		bgimage,
    		bgcolor,
    		bgfixed,
    		center,
    		short,
    		style
    	});

    	$$self.$inject_state = $$props => {
    		if ('theme' in $$props) $$invalidate(0, theme = $$props.theme);
    		if ('bgimage' in $$props) $$invalidate(5, bgimage = $$props.bgimage);
    		if ('bgcolor' in $$props) $$invalidate(1, bgcolor = $$props.bgcolor);
    		if ('bgfixed' in $$props) $$invalidate(6, bgfixed = $$props.bgfixed);
    		if ('center' in $$props) $$invalidate(2, center = $$props.center);
    		if ('short' in $$props) $$invalidate(3, short = $$props.short);
    		if ('style' in $$props) $$invalidate(4, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [theme, bgcolor, center, short, style, bgimage, bgfixed, $$scope, slots];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			theme: 0,
    			bgimage: 5,
    			bgcolor: 1,
    			bgfixed: 6,
    			center: 2,
    			short: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get theme() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set theme(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bgimage() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bgimage(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bgcolor() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bgcolor(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bgfixed() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bgfixed(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get center() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set center(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get short() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set short(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\layout\Section.svelte generated by Svelte v3.44.1 */
    const file$4 = "src\\layout\\Section.svelte";

    function create_fragment$4(ctx) {
    	let section;
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			section = element("section");
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "col-medium");
    			add_location(div, file$4, 8, 1, 247);
    			set_style(section, "color", themes[/*theme*/ ctx[0]]['text']);
    			set_style(section, "background-color", themes[/*theme*/ ctx[0]]['background']);
    			add_location(section, file$4, 7, 0, 147);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 2)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[1],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[1])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[1], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*theme*/ 1) {
    				set_style(section, "color", themes[/*theme*/ ctx[0]]['text']);
    			}

    			if (!current || dirty & /*theme*/ 1) {
    				set_style(section, "background-color", themes[/*theme*/ ctx[0]]['background']);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Section', slots, ['default']);
    	let { theme = getContext('theme') } = $$props;
    	const writable_props = ['theme'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Section> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('theme' in $$props) $$invalidate(0, theme = $$props.theme);
    		if ('$$scope' in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ themes, getContext, theme });

    	$$self.$inject_state = $$props => {
    		if ('theme' in $$props) $$invalidate(0, theme = $$props.theme);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [theme, $$scope, slots];
    }

    class Section extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { theme: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Section",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get theme() {
    		throw new Error("<Section>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set theme(value) {
    		throw new Error("<Section>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /**
     * Returns a function, that, as long as it continues to be invoked, will not
     * be triggered. The function will be called after it stops being called for
     * N milliseconds. If `immediate` is passed, trigger the function on the
     * leading edge, instead of the trailing. The function also has a property 'clear' 
     * that is a function which will clear the timer to prevent previously scheduled executions. 
     *
     * @source underscore.js
     * @see http://unscriptable.com/2009/03/20/debouncing-javascript-methods/
     * @param {Function} function to wrap
     * @param {Number} timeout in ms (`100`)
     * @param {Boolean} whether to execute at the beginning (`false`)
     * @api public
     */
    function debounce(func, wait, immediate){
      var timeout, args, context, timestamp, result;
      if (null == wait) wait = 100;

      function later() {
        var last = Date.now() - timestamp;

        if (last < wait && last >= 0) {
          timeout = setTimeout(later, wait - last);
        } else {
          timeout = null;
          if (!immediate) {
            result = func.apply(context, args);
            context = args = null;
          }
        }
      }
      var debounced = function(){
        context = this;
        args = arguments;
        timestamp = Date.now();
        var callNow = immediate && !timeout;
        if (!timeout) timeout = setTimeout(later, wait);
        if (callNow) {
          result = func.apply(context, args);
          context = args = null;
        }

        return result;
      };

      debounced.clear = function() {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
      };
      
      debounced.flush = function() {
        if (timeout) {
          result = func.apply(context, args);
          context = args = null;
          
          clearTimeout(timeout);
          timeout = null;
        }
      };

      return debounced;
    }
    // Adds compatibility for ES modules
    debounce.debounce = debounce;

    var debounce_1 = debounce;

    /* src\layout\Media.svelte generated by Svelte v3.44.1 */
    const file$5 = "src\\layout\\Media.svelte";

    // (95:0) {:else}
    function create_else_block$1(ctx) {
    	let figure;
    	let div1;
    	let div0;
    	let div0_class_value;
    	let div1_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[13].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[12], null);

    	const block = {
    		c: function create() {
    			figure = element("figure");
    			div1 = element("div");
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div0, "class", div0_class_value = "grid" + /*gridClass*/ ctx[5] + " svelte-15qq8ff");
    			set_style(div0, "grid-gap", /*gridGap*/ ctx[8]);
    			set_style(div0, "min-height", /*rowHeight*/ ctx[7]);
    			add_location(div0, file$5, 97, 2, 2518);
    			attr_dev(div1, "class", div1_class_value = "col-" + /*col*/ ctx[1] + " svelte-15qq8ff");
    			add_location(div1, file$5, 96, 1, 2491);
    			set_style(figure, "color", themes[/*theme*/ ctx[0]]['text']);
    			set_style(figure, "background-color", themes[/*theme*/ ctx[0]]['background']);
    			add_location(figure, file$5, 95, 0, 2391);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, figure, anchor);
    			append_dev(figure, div1);
    			append_dev(div1, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 4096)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[12],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[12])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[12], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*col*/ 2 && div1_class_value !== (div1_class_value = "col-" + /*col*/ ctx[1] + " svelte-15qq8ff")) {
    				attr_dev(div1, "class", div1_class_value);
    			}

    			if (!current || dirty & /*theme*/ 1) {
    				set_style(figure, "color", themes[/*theme*/ ctx[0]]['text']);
    			}

    			if (!current || dirty & /*theme*/ 1) {
    				set_style(figure, "background-color", themes[/*theme*/ ctx[0]]['background']);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(figure);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(95:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (87:0) {#if nogrid}
    function create_if_block_1$1(ctx) {
    	let figure;
    	let div1;
    	let div0;
    	let div0_resize_listener;
    	let div1_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[13].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[12], null);

    	const block = {
    		c: function create() {
    			figure = element("figure");
    			div1 = element("div");
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div0, "class", "grid-ms svelte-15qq8ff");
    			add_render_callback(() => /*div0_elementresize_handler*/ ctx[15].call(div0));
    			add_location(div0, file$5, 89, 2, 2267);
    			attr_dev(div1, "class", div1_class_value = "col-" + /*col*/ ctx[1] + " svelte-15qq8ff");
    			add_location(div1, file$5, 88, 1, 2240);
    			set_style(figure, "color", themes[/*theme*/ ctx[0]]['text']);
    			set_style(figure, "background-color", themes[/*theme*/ ctx[0]]['background']);
    			add_location(figure, file$5, 87, 0, 2140);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, figure, anchor);
    			append_dev(figure, div1);
    			append_dev(div1, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			/*div0_binding*/ ctx[14](div0);
    			div0_resize_listener = add_resize_listener(div0, /*div0_elementresize_handler*/ ctx[15].bind(div0));
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 4096)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[12],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[12])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[12], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*col*/ 2 && div1_class_value !== (div1_class_value = "col-" + /*col*/ ctx[1] + " svelte-15qq8ff")) {
    				attr_dev(div1, "class", div1_class_value);
    			}

    			if (!current || dirty & /*theme*/ 1) {
    				set_style(figure, "color", themes[/*theme*/ ctx[0]]['text']);
    			}

    			if (!current || dirty & /*theme*/ 1) {
    				set_style(figure, "background-color", themes[/*theme*/ ctx[0]]['background']);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(figure);
    			if (default_slot) default_slot.d(detaching);
    			/*div0_binding*/ ctx[14](null);
    			div0_resize_listener();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(87:0) {#if nogrid}",
    		ctx
    	});

    	return block;
    }

    // (104:0) {#if caption}
    function create_if_block$1(ctx) {
    	let caption_1;
    	let div1;
    	let div0;

    	const block = {
    		c: function create() {
    			caption_1 = element("caption");
    			div1 = element("div");
    			div0 = element("div");
    			attr_dev(div0, "class", "caption");
    			add_location(div0, file$5, 106, 3, 2805);
    			attr_dev(div1, "class", "col-medium");
    			add_location(div1, file$5, 105, 2, 2776);
    			set_style(caption_1, "color", themes[/*theme*/ ctx[0]]['text']);
    			set_style(caption_1, "background-color", themes[/*theme*/ ctx[0]]['background']);
    			add_location(caption_1, file$5, 104, 1, 2674);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, caption_1, anchor);
    			append_dev(caption_1, div1);
    			append_dev(div1, div0);
    			div0.innerHTML = /*caption*/ ctx[2];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*caption*/ 4) div0.innerHTML = /*caption*/ ctx[2];
    			if (dirty & /*theme*/ 1) {
    				set_style(caption_1, "color", themes[/*theme*/ ctx[0]]['text']);
    			}

    			if (dirty & /*theme*/ 1) {
    				set_style(caption_1, "background-color", themes[/*theme*/ ctx[0]]['background']);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(caption_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(104:0) {#if caption}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let current_block_type_index;
    	let if_block0;
    	let t;
    	let if_block1_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1$1, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*nogrid*/ ctx[6]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	let if_block1 = /*caption*/ ctx[2] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if_block0.p(ctx, dirty);

    			if (/*caption*/ ctx[2]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$1(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Media', slots, ['default']);
    	const colWidths = { narrow: 200, medium: 300, wide: 500 };
    	let { theme = getContext("theme") } = $$props;
    	let { col = "medium" } = $$props;
    	let { grid = null } = $$props;
    	let { caption = null } = $$props;
    	let { height = 200 } = $$props;
    	let { gap = 12 } = $$props;
    	let gridClass = grid ? ` grid-${grid}` : '';
    	let nogrid = !("grid-gap" in document.body.style);
    	let rowHeight = !Number.isNaN(height) ? height + "px" : height;
    	let gridGap = !Number.isNaN(gap) ? gap + "px" : gap;

    	// The code below this point mimics CSS Grid functionality in IE 11
    	const minWidth = grid && colWidths[grid] ? colWidths[grid] : null;

    	let gridWidth;
    	let cols;
    	let el;
    	let divs;
    	let count;

    	if (nogrid) {
    		onMount(() => {
    			resize();
    		});
    	}

    	const update = debounce_1.debounce(resize, 200);

    	function resize() {
    		if (el && !divs) {
    			let arr = [];
    			let children = el.childNodes;

    			children.forEach(child => {
    				if (child.nodeName == "DIV") {
    					arr.push(child);
    				}
    			});

    			divs = arr;
    		}

    		count = divs.length;

    		cols = !minWidth || gridWidth <= minWidth
    		? 1
    		: Math.floor(gridWidth / minWidth);

    		makeCols();
    	}

    	function makeCols() {
    		let r = Math.ceil(count / cols) > 1
    		? `-ms-grid-rows: 1fr (${gap}px 1fr)[${Math.ceil(count / cols) - 1}]; grid-template-rows: 1fr repeat(${Math.ceil(count / cols) - 1}, ${gap}px 1fr);`
    		: `-ms-grid-rows: 1fr; grid-template-rows: 1fr;`;

    		let c = cols > 1
    		? `-ms-grid-columns: 1fr (${gap}px 1fr)[${cols - 1}]; grid-template-columns: 1fr repeat(${cols - 1}, ${gap}px 1fr);`
    		: "";

    		$$invalidate(4, el.style.cssText = r + c, el);

    		divs.forEach((div, i) => {
    			let col = i % cols * 2 + 1;
    			let row = Math.floor(i / cols) * 2 + 1;
    			div.style.cssText = `-ms-grid-column: ${col}; -ms-grid-row: ${row}; grid-column: ${col}; grid-row: ${row}; min-height: ${rowHeight};`;
    		});
    	}

    	const writable_props = ['theme', 'col', 'grid', 'caption', 'height', 'gap'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Media> was created with unknown prop '${key}'`);
    	});

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			el = $$value;
    			$$invalidate(4, el);
    		});
    	}

    	function div0_elementresize_handler() {
    		gridWidth = this.clientWidth;
    		$$invalidate(3, gridWidth);
    	}

    	$$self.$$set = $$props => {
    		if ('theme' in $$props) $$invalidate(0, theme = $$props.theme);
    		if ('col' in $$props) $$invalidate(1, col = $$props.col);
    		if ('grid' in $$props) $$invalidate(9, grid = $$props.grid);
    		if ('caption' in $$props) $$invalidate(2, caption = $$props.caption);
    		if ('height' in $$props) $$invalidate(10, height = $$props.height);
    		if ('gap' in $$props) $$invalidate(11, gap = $$props.gap);
    		if ('$$scope' in $$props) $$invalidate(12, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		themes,
    		onMount,
    		getContext,
    		debounce: debounce_1.debounce,
    		colWidths,
    		theme,
    		col,
    		grid,
    		caption,
    		height,
    		gap,
    		gridClass,
    		nogrid,
    		rowHeight,
    		gridGap,
    		minWidth,
    		gridWidth,
    		cols,
    		el,
    		divs,
    		count,
    		update,
    		resize,
    		makeCols
    	});

    	$$self.$inject_state = $$props => {
    		if ('theme' in $$props) $$invalidate(0, theme = $$props.theme);
    		if ('col' in $$props) $$invalidate(1, col = $$props.col);
    		if ('grid' in $$props) $$invalidate(9, grid = $$props.grid);
    		if ('caption' in $$props) $$invalidate(2, caption = $$props.caption);
    		if ('height' in $$props) $$invalidate(10, height = $$props.height);
    		if ('gap' in $$props) $$invalidate(11, gap = $$props.gap);
    		if ('gridClass' in $$props) $$invalidate(5, gridClass = $$props.gridClass);
    		if ('nogrid' in $$props) $$invalidate(6, nogrid = $$props.nogrid);
    		if ('rowHeight' in $$props) $$invalidate(7, rowHeight = $$props.rowHeight);
    		if ('gridGap' in $$props) $$invalidate(8, gridGap = $$props.gridGap);
    		if ('gridWidth' in $$props) $$invalidate(3, gridWidth = $$props.gridWidth);
    		if ('cols' in $$props) cols = $$props.cols;
    		if ('el' in $$props) $$invalidate(4, el = $$props.el);
    		if ('divs' in $$props) divs = $$props.divs;
    		if ('count' in $$props) count = $$props.count;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*gridWidth*/ 8) {
    			 nogrid && (minWidth || gridWidth) && update();
    		}
    	};

    	return [
    		theme,
    		col,
    		caption,
    		gridWidth,
    		el,
    		gridClass,
    		nogrid,
    		rowHeight,
    		gridGap,
    		grid,
    		height,
    		gap,
    		$$scope,
    		slots,
    		div0_binding,
    		div0_elementresize_handler
    	];
    }

    class Media extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			theme: 0,
    			col: 1,
    			grid: 9,
    			caption: 2,
    			height: 10,
    			gap: 11
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Media",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get theme() {
    		throw new Error("<Media>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set theme(value) {
    		throw new Error("<Media>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get col() {
    		throw new Error("<Media>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set col(value) {
    		throw new Error("<Media>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get grid() {
    		throw new Error("<Media>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set grid(value) {
    		throw new Error("<Media>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get caption() {
    		throw new Error("<Media>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set caption(value) {
    		throw new Error("<Media>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<Media>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<Media>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get gap() {
    		throw new Error("<Media>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set gap(value) {
    		throw new Error("<Media>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\layout\Scroller.svelte generated by Svelte v3.44.1 */

    const { window: window_1 } = globals;
    const file$6 = "src\\layout\\Scroller.svelte";
    const get_foreground_slot_changes = dirty => ({});
    const get_foreground_slot_context = ctx => ({});
    const get_background_slot_changes = dirty => ({});
    const get_background_slot_context = ctx => ({});

    function create_fragment$6(ctx) {
    	let svelte_scroller_outer;
    	let svelte_scroller_background_container;
    	let svelte_scroller_background;
    	let t;
    	let svelte_scroller_foreground;
    	let current;
    	let mounted;
    	let dispose;
    	add_render_callback(/*onwindowresize*/ ctx[19]);
    	const background_slot_template = /*#slots*/ ctx[18].background;
    	const background_slot = create_slot(background_slot_template, ctx, /*$$scope*/ ctx[17], get_background_slot_context);
    	const foreground_slot_template = /*#slots*/ ctx[18].foreground;
    	const foreground_slot = create_slot(foreground_slot_template, ctx, /*$$scope*/ ctx[17], get_foreground_slot_context);

    	const block = {
    		c: function create() {
    			svelte_scroller_outer = element("svelte-scroller-outer");
    			svelte_scroller_background_container = element("svelte-scroller-background-container");
    			svelte_scroller_background = element("svelte-scroller-background");
    			if (background_slot) background_slot.c();
    			t = space();
    			svelte_scroller_foreground = element("svelte-scroller-foreground");
    			if (foreground_slot) foreground_slot.c();
    			set_custom_element_data(svelte_scroller_background, "class", "svelte-3stote");
    			add_location(svelte_scroller_background, file$6, 186, 2, 4913);
    			set_custom_element_data(svelte_scroller_background_container, "class", "background-container svelte-3stote");
    			add_location(svelte_scroller_background_container, file$6, 185, 1, 4818);
    			set_custom_element_data(svelte_scroller_foreground, "class", "svelte-3stote");
    			add_location(svelte_scroller_foreground, file$6, 191, 1, 5080);
    			set_custom_element_data(svelte_scroller_outer, "class", "svelte-3stote");
    			toggle_class(svelte_scroller_outer, "splitscreen", /*splitscreen*/ ctx[0]);
    			add_location(svelte_scroller_outer, file$6, 184, 0, 4756);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svelte_scroller_outer, anchor);
    			append_dev(svelte_scroller_outer, svelte_scroller_background_container);
    			append_dev(svelte_scroller_background_container, svelte_scroller_background);

    			if (background_slot) {
    				background_slot.m(svelte_scroller_background, null);
    			}

    			/*svelte_scroller_background_binding*/ ctx[20](svelte_scroller_background);
    			/*svelte_scroller_background_container_binding*/ ctx[21](svelte_scroller_background_container);
    			append_dev(svelte_scroller_outer, t);
    			append_dev(svelte_scroller_outer, svelte_scroller_foreground);

    			if (foreground_slot) {
    				foreground_slot.m(svelte_scroller_foreground, null);
    			}

    			/*svelte_scroller_foreground_binding*/ ctx[22](svelte_scroller_foreground);
    			/*svelte_scroller_outer_binding*/ ctx[23](svelte_scroller_outer);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window_1, "resize", /*onwindowresize*/ ctx[19]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (background_slot) {
    				if (background_slot.p && (!current || dirty[0] & /*$$scope*/ 131072)) {
    					update_slot_base(
    						background_slot,
    						background_slot_template,
    						ctx,
    						/*$$scope*/ ctx[17],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[17])
    						: get_slot_changes(background_slot_template, /*$$scope*/ ctx[17], dirty, get_background_slot_changes),
    						get_background_slot_context
    					);
    				}
    			}

    			if (foreground_slot) {
    				if (foreground_slot.p && (!current || dirty[0] & /*$$scope*/ 131072)) {
    					update_slot_base(
    						foreground_slot,
    						foreground_slot_template,
    						ctx,
    						/*$$scope*/ ctx[17],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[17])
    						: get_slot_changes(foreground_slot_template, /*$$scope*/ ctx[17], dirty, get_foreground_slot_changes),
    						get_foreground_slot_context
    					);
    				}
    			}

    			if (dirty[0] & /*splitscreen*/ 1) {
    				toggle_class(svelte_scroller_outer, "splitscreen", /*splitscreen*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(background_slot, local);
    			transition_in(foreground_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(background_slot, local);
    			transition_out(foreground_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svelte_scroller_outer);
    			if (background_slot) background_slot.d(detaching);
    			/*svelte_scroller_background_binding*/ ctx[20](null);
    			/*svelte_scroller_background_container_binding*/ ctx[21](null);
    			if (foreground_slot) foreground_slot.d(detaching);
    			/*svelte_scroller_foreground_binding*/ ctx[22](null);
    			/*svelte_scroller_outer_binding*/ ctx[23](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const handlers = [];
    let manager;

    if (typeof window !== 'undefined') {
    	const run_all = () => handlers.forEach(fn => fn());
    	window.addEventListener('scroll', run_all);
    	window.addEventListener('resize', run_all);
    }

    if (typeof IntersectionObserver !== 'undefined') {
    	const map = new Map();

    	const observer = new IntersectionObserver((entries, observer) => {
    			entries.forEach(entry => {
    				const update = map.get(entry.target);
    				const index = handlers.indexOf(update);

    				if (entry.isIntersecting) {
    					if (index === -1) handlers.push(update);
    				} else {
    					update();
    					if (index !== -1) handlers.splice(index, 1);
    				}
    			});
    		},
    	{
    			rootMargin: '400px 0px', // TODO why 400?
    			
    		});

    	manager = {
    		add: ({ outer, update }) => {
    			const { top, bottom } = outer.getBoundingClientRect();
    			if (top < window.innerHeight && bottom > 0) handlers.push(update);
    			map.set(outer, update);
    			observer.observe(outer);
    		},
    		remove: ({ outer, update }) => {
    			const index = handlers.indexOf(update);
    			if (index !== -1) handlers.splice(index, 1);
    			map.delete(outer);
    			observer.unobserve(outer);
    		}
    	};
    } else {
    	manager = {
    		add: ({ update }) => {
    			handlers.push(update);
    		},
    		remove: ({ update }) => {
    			const index = handlers.indexOf(update);
    			if (index !== -1) handlers.splice(index, 1);
    		}
    	};
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let top_px;
    	let bottom_px;
    	let threshold_px;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Scroller', slots, ['background','foreground']);
    	let { top = 0 } = $$props;
    	let { bottom = 1 } = $$props;
    	let { threshold = 0.5 } = $$props;
    	let { query = 'section' } = $$props;
    	let { parallax = false } = $$props;
    	let { index = 0 } = $$props;
    	let { count = 0 } = $$props;
    	let { offset = 0 } = $$props;
    	let { progress = 0 } = $$props;
    	let { visible = false } = $$props;
    	let { splitscreen = false } = $$props;
    	let { id = null } = $$props;
    	let outer;
    	let bgContainer; // IE patch. Container binding to update inline style
    	let foreground;
    	let background;
    	let left;
    	let sections;
    	let wh = 0;
    	let fixed;
    	let offset_top;
    	let width = 1;
    	let height;
    	let inverted;

    	onMount(() => {
    		sections = foreground.querySelectorAll(query);
    		$$invalidate(7, count = sections.length);
    		update();
    		const scroller = { outer, update };
    		manager.add(scroller);
    		return () => manager.remove(scroller);
    	});

    	// IE patch. BG container style (fixed/unfixed) set via function
    	function setFixed() {
    		if (bgContainer) {
    			let style = `position: ${fixed ? 'fixed' : 'absolute'}; top: 0; transform: translate(0, ${offset_top}px); width: ${width}px; z-index: ${inverted ? 3 : 1};`;
    			$$invalidate(3, bgContainer.style.cssText = style, bgContainer);
    		}
    	}

    	function update() {
    		if (!foreground) return;

    		// re-measure outer container
    		const bcr = outer.getBoundingClientRect();

    		left = bcr.left;
    		width = bcr.right - bcr.left;

    		// determine fix state
    		const fg = foreground.getBoundingClientRect();

    		const bg = background.getBoundingClientRect();
    		$$invalidate(10, visible = fg.top < wh && fg.bottom > 0);
    		const foreground_height = fg.bottom - fg.top;
    		const background_height = bg.bottom - bg.top;
    		const available_space = bottom_px - top_px;
    		$$invalidate(9, progress = (top_px - fg.top) / (foreground_height - available_space));

    		if (progress <= 0) {
    			offset_top = 0;

    			if (fixed) {
    				fixed = false;
    				setFixed();
    			} // Non-IE specific patch to avoid setting style repeatedly
    		} else if (progress >= 1) {
    			offset_top = parallax
    			? foreground_height - background_height
    			: foreground_height - available_space;

    			if (fixed) {
    				fixed = false;
    				setFixed();
    			}
    		} else {
    			offset_top = parallax
    			? Math.round(top_px - progress * (background_height - available_space))
    			: top_px;

    			if (!fixed) {
    				fixed = true;
    				setFixed();
    			}
    		}

    		for ($$invalidate(6, index = 0); index < sections.length; $$invalidate(6, index += 1)) {
    			const section = sections[index];
    			const { top } = section.getBoundingClientRect();
    			const next = sections[index + 1];
    			const bottom = next ? next.getBoundingClientRect().top : fg.bottom;
    			$$invalidate(8, offset = (threshold_px - top) / (bottom - top));
    			$$invalidate(11, id = section.dataset.id ? section.dataset.id : null);
    			if (bottom >= threshold_px) break;
    		}
    	}

    	const writable_props = [
    		'top',
    		'bottom',
    		'threshold',
    		'query',
    		'parallax',
    		'index',
    		'count',
    		'offset',
    		'progress',
    		'visible',
    		'splitscreen',
    		'id'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Scroller> was created with unknown prop '${key}'`);
    	});

    	function onwindowresize() {
    		$$invalidate(1, wh = window_1.innerHeight);
    	}

    	function svelte_scroller_background_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			background = $$value;
    			$$invalidate(5, background);
    		});
    	}

    	function svelte_scroller_background_container_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			bgContainer = $$value;
    			$$invalidate(3, bgContainer);
    		});
    	}

    	function svelte_scroller_foreground_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			foreground = $$value;
    			$$invalidate(4, foreground);
    		});
    	}

    	function svelte_scroller_outer_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			outer = $$value;
    			$$invalidate(2, outer);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('top' in $$props) $$invalidate(12, top = $$props.top);
    		if ('bottom' in $$props) $$invalidate(13, bottom = $$props.bottom);
    		if ('threshold' in $$props) $$invalidate(14, threshold = $$props.threshold);
    		if ('query' in $$props) $$invalidate(15, query = $$props.query);
    		if ('parallax' in $$props) $$invalidate(16, parallax = $$props.parallax);
    		if ('index' in $$props) $$invalidate(6, index = $$props.index);
    		if ('count' in $$props) $$invalidate(7, count = $$props.count);
    		if ('offset' in $$props) $$invalidate(8, offset = $$props.offset);
    		if ('progress' in $$props) $$invalidate(9, progress = $$props.progress);
    		if ('visible' in $$props) $$invalidate(10, visible = $$props.visible);
    		if ('splitscreen' in $$props) $$invalidate(0, splitscreen = $$props.splitscreen);
    		if ('id' in $$props) $$invalidate(11, id = $$props.id);
    		if ('$$scope' in $$props) $$invalidate(17, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		handlers,
    		manager,
    		onMount,
    		top,
    		bottom,
    		threshold,
    		query,
    		parallax,
    		index,
    		count,
    		offset,
    		progress,
    		visible,
    		splitscreen,
    		id,
    		outer,
    		bgContainer,
    		foreground,
    		background,
    		left,
    		sections,
    		wh,
    		fixed,
    		offset_top,
    		width,
    		height,
    		inverted,
    		setFixed,
    		update,
    		threshold_px,
    		top_px,
    		bottom_px
    	});

    	$$self.$inject_state = $$props => {
    		if ('top' in $$props) $$invalidate(12, top = $$props.top);
    		if ('bottom' in $$props) $$invalidate(13, bottom = $$props.bottom);
    		if ('threshold' in $$props) $$invalidate(14, threshold = $$props.threshold);
    		if ('query' in $$props) $$invalidate(15, query = $$props.query);
    		if ('parallax' in $$props) $$invalidate(16, parallax = $$props.parallax);
    		if ('index' in $$props) $$invalidate(6, index = $$props.index);
    		if ('count' in $$props) $$invalidate(7, count = $$props.count);
    		if ('offset' in $$props) $$invalidate(8, offset = $$props.offset);
    		if ('progress' in $$props) $$invalidate(9, progress = $$props.progress);
    		if ('visible' in $$props) $$invalidate(10, visible = $$props.visible);
    		if ('splitscreen' in $$props) $$invalidate(0, splitscreen = $$props.splitscreen);
    		if ('id' in $$props) $$invalidate(11, id = $$props.id);
    		if ('outer' in $$props) $$invalidate(2, outer = $$props.outer);
    		if ('bgContainer' in $$props) $$invalidate(3, bgContainer = $$props.bgContainer);
    		if ('foreground' in $$props) $$invalidate(4, foreground = $$props.foreground);
    		if ('background' in $$props) $$invalidate(5, background = $$props.background);
    		if ('left' in $$props) left = $$props.left;
    		if ('sections' in $$props) sections = $$props.sections;
    		if ('wh' in $$props) $$invalidate(1, wh = $$props.wh);
    		if ('fixed' in $$props) fixed = $$props.fixed;
    		if ('offset_top' in $$props) offset_top = $$props.offset_top;
    		if ('width' in $$props) width = $$props.width;
    		if ('height' in $$props) height = $$props.height;
    		if ('inverted' in $$props) inverted = $$props.inverted;
    		if ('threshold_px' in $$props) threshold_px = $$props.threshold_px;
    		if ('top_px' in $$props) top_px = $$props.top_px;
    		if ('bottom_px' in $$props) bottom_px = $$props.bottom_px;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*top, wh*/ 4098) {
    			 top_px = Math.round(top * wh);
    		}

    		if ($$self.$$.dirty[0] & /*bottom, wh*/ 8194) {
    			 bottom_px = Math.round(bottom * wh);
    		}

    		if ($$self.$$.dirty[0] & /*threshold, wh*/ 16386) {
    			 threshold_px = Math.round(threshold * wh);
    		}

    		if ($$self.$$.dirty[0] & /*top, bottom, threshold, parallax*/ 94208) {
    			 (update());
    		}
    	};

    	return [
    		splitscreen,
    		wh,
    		outer,
    		bgContainer,
    		foreground,
    		background,
    		index,
    		count,
    		offset,
    		progress,
    		visible,
    		id,
    		top,
    		bottom,
    		threshold,
    		query,
    		parallax,
    		$$scope,
    		slots,
    		onwindowresize,
    		svelte_scroller_background_binding,
    		svelte_scroller_background_container_binding,
    		svelte_scroller_foreground_binding,
    		svelte_scroller_outer_binding
    	];
    }

    class Scroller extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$6,
    			create_fragment$6,
    			safe_not_equal,
    			{
    				top: 12,
    				bottom: 13,
    				threshold: 14,
    				query: 15,
    				parallax: 16,
    				index: 6,
    				count: 7,
    				offset: 8,
    				progress: 9,
    				visible: 10,
    				splitscreen: 0,
    				id: 11
    			},
    			null,
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Scroller",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get top() {
    		throw new Error("<Scroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set top(value) {
    		throw new Error("<Scroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bottom() {
    		throw new Error("<Scroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bottom(value) {
    		throw new Error("<Scroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get threshold() {
    		throw new Error("<Scroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set threshold(value) {
    		throw new Error("<Scroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get query() {
    		throw new Error("<Scroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set query(value) {
    		throw new Error("<Scroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get parallax() {
    		throw new Error("<Scroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set parallax(value) {
    		throw new Error("<Scroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get index() {
    		throw new Error("<Scroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<Scroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get count() {
    		throw new Error("<Scroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set count(value) {
    		throw new Error("<Scroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get offset() {
    		throw new Error("<Scroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set offset(value) {
    		throw new Error("<Scroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get progress() {
    		throw new Error("<Scroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set progress(value) {
    		throw new Error("<Scroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get visible() {
    		throw new Error("<Scroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set visible(value) {
    		throw new Error("<Scroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get splitscreen() {
    		throw new Error("<Scroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set splitscreen(value) {
    		throw new Error("<Scroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Scroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Scroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\layout\Filler.svelte generated by Svelte v3.44.1 */
    const file$7 = "src\\layout\\Filler.svelte";

    function create_fragment$7(ctx) {
    	let section;
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

    	const block = {
    		c: function create() {
    			section = element("section");
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "middle svelte-1odf9sx");
    			toggle_class(div, "center", /*center*/ ctx[1]);
    			toggle_class(div, "col-medium", !/*wide*/ ctx[2]);
    			toggle_class(div, "col-wide", /*wide*/ ctx[2]);
    			toggle_class(div, "height-full", !/*short*/ ctx[3]);
    			toggle_class(div, "short", /*short*/ ctx[3]);
    			add_location(div, file$7, 20, 1, 424);
    			set_style(section, "color", themes[/*theme*/ ctx[0]]['text']);
    			set_style(section, "background-color", themes[/*theme*/ ctx[0]]['background']);
    			attr_dev(section, "class", "svelte-1odf9sx");
    			add_location(section, file$7, 19, 0, 323);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 16)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[4],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[4])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[4], dirty, null),
    						null
    					);
    				}
    			}

    			if (dirty & /*center*/ 2) {
    				toggle_class(div, "center", /*center*/ ctx[1]);
    			}

    			if (dirty & /*wide*/ 4) {
    				toggle_class(div, "col-medium", !/*wide*/ ctx[2]);
    			}

    			if (dirty & /*wide*/ 4) {
    				toggle_class(div, "col-wide", /*wide*/ ctx[2]);
    			}

    			if (dirty & /*short*/ 8) {
    				toggle_class(div, "height-full", !/*short*/ ctx[3]);
    			}

    			if (dirty & /*short*/ 8) {
    				toggle_class(div, "short", /*short*/ ctx[3]);
    			}

    			if (!current || dirty & /*theme*/ 1) {
    				set_style(section, "color", themes[/*theme*/ ctx[0]]['text']);
    			}

    			if (!current || dirty & /*theme*/ 1) {
    				set_style(section, "background-color", themes[/*theme*/ ctx[0]]['background']);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Filler', slots, ['default']);
    	let { theme = getContext('theme') } = $$props;
    	let { center = true } = $$props;
    	let { wide = false } = $$props;
    	let { short = false } = $$props;
    	const writable_props = ['theme', 'center', 'wide', 'short'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Filler> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('theme' in $$props) $$invalidate(0, theme = $$props.theme);
    		if ('center' in $$props) $$invalidate(1, center = $$props.center);
    		if ('wide' in $$props) $$invalidate(2, wide = $$props.wide);
    		if ('short' in $$props) $$invalidate(3, short = $$props.short);
    		if ('$$scope' in $$props) $$invalidate(4, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		themes,
    		getContext,
    		theme,
    		center,
    		wide,
    		short
    	});

    	$$self.$inject_state = $$props => {
    		if ('theme' in $$props) $$invalidate(0, theme = $$props.theme);
    		if ('center' in $$props) $$invalidate(1, center = $$props.center);
    		if ('wide' in $$props) $$invalidate(2, wide = $$props.wide);
    		if ('short' in $$props) $$invalidate(3, short = $$props.short);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [theme, center, wide, short, $$scope, slots];
    }

    class Filler extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { theme: 0, center: 1, wide: 2, short: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Filler",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get theme() {
    		throw new Error("<Filler>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set theme(value) {
    		throw new Error("<Filler>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get center() {
    		throw new Error("<Filler>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set center(value) {
    		throw new Error("<Filler>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get wide() {
    		throw new Error("<Filler>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set wide(value) {
    		throw new Error("<Filler>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get short() {
    		throw new Error("<Filler>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set short(value) {
    		throw new Error("<Filler>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\layout\Divider.svelte generated by Svelte v3.44.1 */
    const file$8 = "src\\layout\\Divider.svelte";

    // (13:4) {:else}
    function create_else_block$2(ctx) {
    	let hr_1;

    	const block = {
    		c: function create() {
    			hr_1 = element("hr");
    			set_style(hr_1, "color", themes[/*theme*/ ctx[0]]['muted']);
    			set_style(hr_1, "border", "none");
    			attr_dev(hr_1, "class", "svelte-1l2to1w");
    			add_location(hr_1, file$8, 13, 4, 382);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, hr_1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*theme*/ 1) {
    				set_style(hr_1, "color", themes[/*theme*/ ctx[0]]['muted']);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(hr_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(13:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (11:4) {#if hr}
    function create_if_block$2(ctx) {
    	let hr_1;

    	const block = {
    		c: function create() {
    			hr_1 = element("hr");
    			set_style(hr_1, "color", themes[/*theme*/ ctx[0]]['muted']);
    			attr_dev(hr_1, "class", "svelte-1l2to1w");
    			add_location(hr_1, file$8, 11, 4, 318);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, hr_1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*theme*/ 1) {
    				set_style(hr_1, "color", themes[/*theme*/ ctx[0]]['muted']);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(hr_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(11:4) {#if hr}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let section;
    	let div;

    	function select_block_type(ctx, dirty) {
    		if (/*hr*/ ctx[1]) return create_if_block$2;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			section = element("section");
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", "col-medium");
    			add_location(div, file$8, 9, 1, 274);
    			set_style(section, "color", themes[/*theme*/ ctx[0]]['text']);
    			set_style(section, "background-color", themes[/*theme*/ ctx[0]]['background']);
    			add_location(section, file$8, 8, 0, 173);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div);
    			if_block.m(div, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}

    			if (dirty & /*theme*/ 1) {
    				set_style(section, "color", themes[/*theme*/ ctx[0]]['text']);
    			}

    			if (dirty & /*theme*/ 1) {
    				set_style(section, "background-color", themes[/*theme*/ ctx[0]]['background']);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Divider', slots, []);
    	let { theme = getContext('theme') } = $$props;
    	let { hr = true } = $$props;
    	const writable_props = ['theme', 'hr'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Divider> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('theme' in $$props) $$invalidate(0, theme = $$props.theme);
    		if ('hr' in $$props) $$invalidate(1, hr = $$props.hr);
    	};

    	$$self.$capture_state = () => ({ themes, getContext, theme, hr });

    	$$self.$inject_state = $$props => {
    		if ('theme' in $$props) $$invalidate(0, theme = $$props.theme);
    		if ('hr' in $$props) $$invalidate(1, hr = $$props.hr);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [theme, hr];
    }

    class Divider extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { theme: 0, hr: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Divider",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get theme() {
    		throw new Error("<Divider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set theme(value) {
    		throw new Error("<Divider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hr() {
    		throw new Error("<Divider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hr(value) {
    		throw new Error("<Divider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\ui\Toggle.svelte generated by Svelte v3.44.1 */

    const file$9 = "src\\ui\\Toggle.svelte";

    function create_fragment$9(ctx) {
    	let div;
    	let input;
    	let t0;
    	let label_1;
    	let t1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			input = element("input");
    			t0 = space();
    			label_1 = element("label");
    			t1 = text(/*label*/ ctx[2]);
    			attr_dev(input, "id", /*id*/ ctx[1]);
    			attr_dev(input, "type", "checkbox");
    			attr_dev(input, "class", "switch-input svelte-g1x8yy");
    			attr_dev(input, "tabindex", "0");
    			add_location(input, file$9, 8, 2, 158);
    			attr_dev(label_1, "for", /*id*/ ctx[1]);
    			attr_dev(label_1, "class", "switch-label svelte-g1x8yy");
    			toggle_class(label_1, "mono", /*mono*/ ctx[3]);
    			add_location(label_1, file$9, 9, 2, 239);
    			attr_dev(div, "class", "switch svelte-g1x8yy");
    			add_location(div, file$9, 7, 0, 134);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input);
    			input.checked = /*checked*/ ctx[0];
    			append_dev(div, t0);
    			append_dev(div, label_1);
    			append_dev(label_1, t1);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*input_change_handler*/ ctx[4]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*id*/ 2) {
    				attr_dev(input, "id", /*id*/ ctx[1]);
    			}

    			if (dirty & /*checked*/ 1) {
    				input.checked = /*checked*/ ctx[0];
    			}

    			if (dirty & /*label*/ 4) set_data_dev(t1, /*label*/ ctx[2]);

    			if (dirty & /*id*/ 2) {
    				attr_dev(label_1, "for", /*id*/ ctx[1]);
    			}

    			if (dirty & /*mono*/ 8) {
    				toggle_class(label_1, "mono", /*mono*/ ctx[3]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Toggle', slots, []);
    	let { id = "switch" } = $$props;
    	let { label = "Label" } = $$props;
    	let { mono = false } = $$props;
    	let { checked } = $$props;
    	const writable_props = ['id', 'label', 'mono', 'checked'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Toggle> was created with unknown prop '${key}'`);
    	});

    	function input_change_handler() {
    		checked = this.checked;
    		$$invalidate(0, checked);
    	}

    	$$self.$$set = $$props => {
    		if ('id' in $$props) $$invalidate(1, id = $$props.id);
    		if ('label' in $$props) $$invalidate(2, label = $$props.label);
    		if ('mono' in $$props) $$invalidate(3, mono = $$props.mono);
    		if ('checked' in $$props) $$invalidate(0, checked = $$props.checked);
    	};

    	$$self.$capture_state = () => ({ id, label, mono, checked });

    	$$self.$inject_state = $$props => {
    		if ('id' in $$props) $$invalidate(1, id = $$props.id);
    		if ('label' in $$props) $$invalidate(2, label = $$props.label);
    		if ('mono' in $$props) $$invalidate(3, mono = $$props.mono);
    		if ('checked' in $$props) $$invalidate(0, checked = $$props.checked);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [checked, id, label, mono, input_change_handler];
    }

    class Toggle extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { id: 1, label: 2, mono: 3, checked: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Toggle",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*checked*/ ctx[0] === undefined && !('checked' in props)) {
    			console.warn("<Toggle> was created without expected prop 'checked'");
    		}
    	}

    	get id() {
    		throw new Error("<Toggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Toggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<Toggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Toggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get mono() {
    		throw new Error("<Toggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mono(value) {
    		throw new Error("<Toggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get checked() {
    		throw new Error("<Toggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set checked(value) {
    		throw new Error("<Toggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\ui\Arrow.svelte generated by Svelte v3.44.1 */

    const file$a = "src\\ui\\Arrow.svelte";

    // (14:0) {:else}
    function create_else_block$3(ctx) {
    	let img;
    	let img_src_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (default_slot) default_slot.c();
    			if (!src_url_equal(img.src, img_src_value = "./img/scroll-down-" + /*color*/ ctx[0] + ".svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "arrow left svelte-1prdo3z");
    			attr_dev(img, "alt", "");
    			attr_dev(img, "aria-hidden", "true");
    			toggle_class(img, "bounce", /*animation*/ ctx[1]);
    			add_location(img, file$a, 14, 0, 361);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);

    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*color*/ 1 && !src_url_equal(img.src, img_src_value = "./img/scroll-down-" + /*color*/ ctx[0] + ".svg")) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*animation*/ 2) {
    				toggle_class(img, "bounce", /*animation*/ ctx[1]);
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 8)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[3],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[3])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(14:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (11:0) {#if center}
    function create_if_block$3(ctx) {
    	let br;
    	let t;
    	let img;
    	let img_src_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    			br = element("br");
    			t = space();
    			img = element("img");
    			add_location(br, file$a, 11, 13, 236);
    			if (!src_url_equal(img.src, img_src_value = "./img/scroll-down-" + /*color*/ ctx[0] + ".svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "arrow svelte-1prdo3z");
    			attr_dev(img, "alt", "");
    			attr_dev(img, "aria-hidden", "true");
    			toggle_class(img, "bounce", /*animation*/ ctx[1]);
    			add_location(img, file$a, 12, 0, 243);
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			insert_dev(target, br, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, img, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 8)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[3],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[3])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*color*/ 1 && !src_url_equal(img.src, img_src_value = "./img/scroll-down-" + /*color*/ ctx[0] + ".svg")) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*animation*/ 2) {
    				toggle_class(img, "bounce", /*animation*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    			if (detaching) detach_dev(br);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(11:0) {#if center}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$3, create_else_block$3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*center*/ ctx[2]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Arrow', slots, ['default']);
    	let { color = "black" } = $$props;
    	let { animation = true } = $$props;
    	let { center = true } = $$props;
    	const colors = ["black", "white"];
    	color = colors.includes(color) ? color : "black";
    	const writable_props = ['color', 'animation', 'center'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Arrow> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('color' in $$props) $$invalidate(0, color = $$props.color);
    		if ('animation' in $$props) $$invalidate(1, animation = $$props.animation);
    		if ('center' in $$props) $$invalidate(2, center = $$props.center);
    		if ('$$scope' in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ color, animation, center, colors });

    	$$self.$inject_state = $$props => {
    		if ('color' in $$props) $$invalidate(0, color = $$props.color);
    		if ('animation' in $$props) $$invalidate(1, animation = $$props.animation);
    		if ('center' in $$props) $$invalidate(2, center = $$props.center);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [color, animation, center, $$scope, slots];
    }

    class Arrow extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { color: 0, animation: 1, center: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Arrow",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get color() {
    		throw new Error("<Arrow>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Arrow>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get animation() {
    		throw new Error("<Arrow>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set animation(value) {
    		throw new Error("<Arrow>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get center() {
    		throw new Error("<Arrow>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set center(value) {
    		throw new Error("<Arrow>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    /* --------------------------------------------
     *
     * Return a truthy value if is zero
     *
     * --------------------------------------------
     */
    function canBeZero (val) {
    	if (val === 0) {
    		return true;
    	}
    	return val;
    }

    function makeAccessor (acc) {
    	if (!canBeZero(acc)) return null;
    	if (Array.isArray(acc)) {
    		return d => acc.map(k => {
    			return typeof k !== 'function' ? d[k] : k(d);
    		});
    	} else if (typeof acc !== 'function') { // eslint-disable-line no-else-return
    		return d => d[acc];
    	}
    	return acc;
    }

    /* --------------------------------------------
     *
     * Remove undefined fields from an object
     *
     * --------------------------------------------
     */

    // From Object.fromEntries polyfill https://github.com/tc39/proposal-object-from-entries/blob/master/polyfill.js#L1
    function fromEntries(iter) {
    	const obj = {};

    	for (const pair of iter) {
    		if (Object(pair) !== pair) {
    			throw new TypeError("iterable for fromEntries should yield objects");
    		}

    		// Consistency with Map: contract is that entry has "0" and "1" keys, not
    		// that it is an array or iterable.

    		const { "0": key, "1": val } = pair;

    		Object.defineProperty(obj, key, {
    			configurable: true,
    			enumerable: true,
    			writable: true,
    			value: val,
    		});
    	}

    	return obj;
    }

    function filterObject (obj) {
    	return fromEntries(Object.entries(obj).filter(([key, value]) => {
    		return value !== undefined;
    	}));
    }

    /* --------------------------------------------
     *
     * Calculate the extents of desired fields
     * Returns an object like:
     * `{x: [0, 10], y: [-10, 10]}` if `fields` is
     * `[{field:'x', accessor: d => d.x}, {field:'y', accessor: d => d.y}]`
     *
     * --------------------------------------------
     */
    function calcExtents (data, fields) {
    	if (!Array.isArray(data) || data.length === 0) return null;
    	const extents = {};
    	const fl = fields.length;
    	let i;
    	let j;
    	let f;
    	let val;
    	let s;

    	if (fl) {
    		for (i = 0; i < fl; i += 1) {
    			const firstRow = fields[i].accessor(data[0]);
    			if (firstRow === undefined || firstRow === null || Number.isNaN(firstRow) === true) {
    				extents[fields[i].field] = [Infinity, -Infinity];
    			} else {
    				extents[fields[i].field] = Array.isArray(firstRow) ? firstRow : [firstRow, firstRow];
    			}
    		}
    		const dl = data.length;
    		for (i = 0; i < dl; i += 1) {
    			for (j = 0; j < fl; j += 1) {
    				f = fields[j];
    				val = f.accessor(data[i]);
    				s = f.field;
    				if (Array.isArray(val)) {
    					const vl = val.length;
    					for (let k = 0; k < vl; k += 1) {
    						if (val[k] !== undefined && val[k] !== null && Number.isNaN(val[k]) === false) {
    							if (val[k] < extents[s][0]) {
    								extents[s][0] = val[k];
    							}
    							if (val[k] > extents[s][1]) {
    								extents[s][1] = val[k];
    							}
    						}
    					}
    				} else if (val !== undefined && val !== null && Number.isNaN(val) === false) {
    					if (val < extents[s][0]) {
    						extents[s][0] = val;
    					}
    					if (val > extents[s][1]) {
    						extents[s][1] = val;
    					}
    				}
    			}
    		}
    	} else {
    		return null;
    	}
    	return extents;
    }

    /* --------------------------------------------
     * If we have a domain from settings, fill in
     * any null values with ones from our measured extents
     * otherwise, return the measured extent
     */
    function partialDomain (domain = [], directive) {
    	if (Array.isArray(directive) === true) {
    		return directive.map((d, i) => {
    			if (d === null) {
    				return domain[i];
    			}
    			return d;
    		});
    	}
    	return domain;
    }

    function calcDomain (s) {
    	return function domainCalc ([$extents, $domain]) {
    		return $extents ? partialDomain($extents[s], $domain) : $domain;
    	};
    }

    function ascending(a, b) {
      return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
    }

    function bisector(f) {
      let delta = f;
      let compare = f;

      if (f.length === 1) {
        delta = (d, x) => f(d) - x;
        compare = ascendingComparator(f);
      }

      function left(a, x, lo, hi) {
        if (lo == null) lo = 0;
        if (hi == null) hi = a.length;
        while (lo < hi) {
          const mid = (lo + hi) >>> 1;
          if (compare(a[mid], x) < 0) lo = mid + 1;
          else hi = mid;
        }
        return lo;
      }

      function right(a, x, lo, hi) {
        if (lo == null) lo = 0;
        if (hi == null) hi = a.length;
        while (lo < hi) {
          const mid = (lo + hi) >>> 1;
          if (compare(a[mid], x) > 0) hi = mid;
          else lo = mid + 1;
        }
        return lo;
      }

      function center(a, x, lo, hi) {
        if (lo == null) lo = 0;
        if (hi == null) hi = a.length;
        const i = left(a, x, lo, hi - 1);
        return i > lo && delta(a[i - 1], x) > -delta(a[i], x) ? i - 1 : i;
      }

      return {left, center, right};
    }

    function ascendingComparator(f) {
      return (d, x) => ascending(f(d), x);
    }

    function number(x) {
      return x === null ? NaN : +x;
    }

    const ascendingBisect = bisector(ascending);
    const bisectRight = ascendingBisect.right;
    const bisectCenter = bisector(number).center;

    class InternMap extends Map {
      constructor(entries = [], key = keyof) {
        super();
        Object.defineProperties(this, {_intern: {value: new Map()}, _key: {value: key}});
        for (const [key, value] of entries) this.set(key, value);
      }
      get(key) {
        return super.get(intern_get(this, key));
      }
      has(key) {
        return super.has(intern_get(this, key));
      }
      set(key, value) {
        return super.set(intern_set(this, key), value);
      }
      delete(key) {
        return super.delete(intern_delete(this, key));
      }
    }

    function intern_get({_intern, _key}, value) {
      const key = _key(value);
      return _intern.has(key) ? _intern.get(key) : value;
    }

    function intern_set({_intern, _key}, value) {
      const key = _key(value);
      if (_intern.has(key)) return _intern.get(key);
      _intern.set(key, value);
      return value;
    }

    function intern_delete({_intern, _key}, value) {
      const key = _key(value);
      if (_intern.has(key)) {
        value = _intern.get(value);
        _intern.delete(key);
      }
      return value;
    }

    function keyof(value) {
      return value !== null && typeof value === "object" ? value.valueOf() : value;
    }

    var e10 = Math.sqrt(50),
        e5 = Math.sqrt(10),
        e2 = Math.sqrt(2);

    function ticks(start, stop, count) {
      var reverse,
          i = -1,
          n,
          ticks,
          step;

      stop = +stop, start = +start, count = +count;
      if (start === stop && count > 0) return [start];
      if (reverse = stop < start) n = start, start = stop, stop = n;
      if ((step = tickIncrement(start, stop, count)) === 0 || !isFinite(step)) return [];

      if (step > 0) {
        start = Math.ceil(start / step);
        stop = Math.floor(stop / step);
        ticks = new Array(n = Math.ceil(stop - start + 1));
        while (++i < n) ticks[i] = (start + i) * step;
      } else {
        step = -step;
        start = Math.ceil(start * step);
        stop = Math.floor(stop * step);
        ticks = new Array(n = Math.ceil(stop - start + 1));
        while (++i < n) ticks[i] = (start + i) / step;
      }

      if (reverse) ticks.reverse();

      return ticks;
    }

    function tickIncrement(start, stop, count) {
      var step = (stop - start) / Math.max(0, count),
          power = Math.floor(Math.log(step) / Math.LN10),
          error = step / Math.pow(10, power);
      return power >= 0
          ? (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1) * Math.pow(10, power)
          : -Math.pow(10, -power) / (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1);
    }

    function tickStep(start, stop, count) {
      var step0 = Math.abs(stop - start) / Math.max(0, count),
          step1 = Math.pow(10, Math.floor(Math.log(step0) / Math.LN10)),
          error = step0 / step1;
      if (error >= e10) step1 *= 10;
      else if (error >= e5) step1 *= 5;
      else if (error >= e2) step1 *= 2;
      return stop < start ? -step1 : step1;
    }

    function initRange(domain, range) {
      switch (arguments.length) {
        case 0: break;
        case 1: this.range(domain); break;
        default: this.range(range).domain(domain); break;
      }
      return this;
    }

    function define(constructor, factory, prototype) {
      constructor.prototype = factory.prototype = prototype;
      prototype.constructor = constructor;
    }

    function extend(parent, definition) {
      var prototype = Object.create(parent.prototype);
      for (var key in definition) prototype[key] = definition[key];
      return prototype;
    }

    function Color() {}

    var darker = 0.7;
    var brighter = 1 / darker;

    var reI = "\\s*([+-]?\\d+)\\s*",
        reN = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)\\s*",
        reP = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)%\\s*",
        reHex = /^#([0-9a-f]{3,8})$/,
        reRgbInteger = new RegExp("^rgb\\(" + [reI, reI, reI] + "\\)$"),
        reRgbPercent = new RegExp("^rgb\\(" + [reP, reP, reP] + "\\)$"),
        reRgbaInteger = new RegExp("^rgba\\(" + [reI, reI, reI, reN] + "\\)$"),
        reRgbaPercent = new RegExp("^rgba\\(" + [reP, reP, reP, reN] + "\\)$"),
        reHslPercent = new RegExp("^hsl\\(" + [reN, reP, reP] + "\\)$"),
        reHslaPercent = new RegExp("^hsla\\(" + [reN, reP, reP, reN] + "\\)$");

    var named = {
      aliceblue: 0xf0f8ff,
      antiquewhite: 0xfaebd7,
      aqua: 0x00ffff,
      aquamarine: 0x7fffd4,
      azure: 0xf0ffff,
      beige: 0xf5f5dc,
      bisque: 0xffe4c4,
      black: 0x000000,
      blanchedalmond: 0xffebcd,
      blue: 0x0000ff,
      blueviolet: 0x8a2be2,
      brown: 0xa52a2a,
      burlywood: 0xdeb887,
      cadetblue: 0x5f9ea0,
      chartreuse: 0x7fff00,
      chocolate: 0xd2691e,
      coral: 0xff7f50,
      cornflowerblue: 0x6495ed,
      cornsilk: 0xfff8dc,
      crimson: 0xdc143c,
      cyan: 0x00ffff,
      darkblue: 0x00008b,
      darkcyan: 0x008b8b,
      darkgoldenrod: 0xb8860b,
      darkgray: 0xa9a9a9,
      darkgreen: 0x006400,
      darkgrey: 0xa9a9a9,
      darkkhaki: 0xbdb76b,
      darkmagenta: 0x8b008b,
      darkolivegreen: 0x556b2f,
      darkorange: 0xff8c00,
      darkorchid: 0x9932cc,
      darkred: 0x8b0000,
      darksalmon: 0xe9967a,
      darkseagreen: 0x8fbc8f,
      darkslateblue: 0x483d8b,
      darkslategray: 0x2f4f4f,
      darkslategrey: 0x2f4f4f,
      darkturquoise: 0x00ced1,
      darkviolet: 0x9400d3,
      deeppink: 0xff1493,
      deepskyblue: 0x00bfff,
      dimgray: 0x696969,
      dimgrey: 0x696969,
      dodgerblue: 0x1e90ff,
      firebrick: 0xb22222,
      floralwhite: 0xfffaf0,
      forestgreen: 0x228b22,
      fuchsia: 0xff00ff,
      gainsboro: 0xdcdcdc,
      ghostwhite: 0xf8f8ff,
      gold: 0xffd700,
      goldenrod: 0xdaa520,
      gray: 0x808080,
      green: 0x008000,
      greenyellow: 0xadff2f,
      grey: 0x808080,
      honeydew: 0xf0fff0,
      hotpink: 0xff69b4,
      indianred: 0xcd5c5c,
      indigo: 0x4b0082,
      ivory: 0xfffff0,
      khaki: 0xf0e68c,
      lavender: 0xe6e6fa,
      lavenderblush: 0xfff0f5,
      lawngreen: 0x7cfc00,
      lemonchiffon: 0xfffacd,
      lightblue: 0xadd8e6,
      lightcoral: 0xf08080,
      lightcyan: 0xe0ffff,
      lightgoldenrodyellow: 0xfafad2,
      lightgray: 0xd3d3d3,
      lightgreen: 0x90ee90,
      lightgrey: 0xd3d3d3,
      lightpink: 0xffb6c1,
      lightsalmon: 0xffa07a,
      lightseagreen: 0x20b2aa,
      lightskyblue: 0x87cefa,
      lightslategray: 0x778899,
      lightslategrey: 0x778899,
      lightsteelblue: 0xb0c4de,
      lightyellow: 0xffffe0,
      lime: 0x00ff00,
      limegreen: 0x32cd32,
      linen: 0xfaf0e6,
      magenta: 0xff00ff,
      maroon: 0x800000,
      mediumaquamarine: 0x66cdaa,
      mediumblue: 0x0000cd,
      mediumorchid: 0xba55d3,
      mediumpurple: 0x9370db,
      mediumseagreen: 0x3cb371,
      mediumslateblue: 0x7b68ee,
      mediumspringgreen: 0x00fa9a,
      mediumturquoise: 0x48d1cc,
      mediumvioletred: 0xc71585,
      midnightblue: 0x191970,
      mintcream: 0xf5fffa,
      mistyrose: 0xffe4e1,
      moccasin: 0xffe4b5,
      navajowhite: 0xffdead,
      navy: 0x000080,
      oldlace: 0xfdf5e6,
      olive: 0x808000,
      olivedrab: 0x6b8e23,
      orange: 0xffa500,
      orangered: 0xff4500,
      orchid: 0xda70d6,
      palegoldenrod: 0xeee8aa,
      palegreen: 0x98fb98,
      paleturquoise: 0xafeeee,
      palevioletred: 0xdb7093,
      papayawhip: 0xffefd5,
      peachpuff: 0xffdab9,
      peru: 0xcd853f,
      pink: 0xffc0cb,
      plum: 0xdda0dd,
      powderblue: 0xb0e0e6,
      purple: 0x800080,
      rebeccapurple: 0x663399,
      red: 0xff0000,
      rosybrown: 0xbc8f8f,
      royalblue: 0x4169e1,
      saddlebrown: 0x8b4513,
      salmon: 0xfa8072,
      sandybrown: 0xf4a460,
      seagreen: 0x2e8b57,
      seashell: 0xfff5ee,
      sienna: 0xa0522d,
      silver: 0xc0c0c0,
      skyblue: 0x87ceeb,
      slateblue: 0x6a5acd,
      slategray: 0x708090,
      slategrey: 0x708090,
      snow: 0xfffafa,
      springgreen: 0x00ff7f,
      steelblue: 0x4682b4,
      tan: 0xd2b48c,
      teal: 0x008080,
      thistle: 0xd8bfd8,
      tomato: 0xff6347,
      turquoise: 0x40e0d0,
      violet: 0xee82ee,
      wheat: 0xf5deb3,
      white: 0xffffff,
      whitesmoke: 0xf5f5f5,
      yellow: 0xffff00,
      yellowgreen: 0x9acd32
    };

    define(Color, color, {
      copy: function(channels) {
        return Object.assign(new this.constructor, this, channels);
      },
      displayable: function() {
        return this.rgb().displayable();
      },
      hex: color_formatHex, // Deprecated! Use color.formatHex.
      formatHex: color_formatHex,
      formatHsl: color_formatHsl,
      formatRgb: color_formatRgb,
      toString: color_formatRgb
    });

    function color_formatHex() {
      return this.rgb().formatHex();
    }

    function color_formatHsl() {
      return hslConvert(this).formatHsl();
    }

    function color_formatRgb() {
      return this.rgb().formatRgb();
    }

    function color(format) {
      var m, l;
      format = (format + "").trim().toLowerCase();
      return (m = reHex.exec(format)) ? (l = m[1].length, m = parseInt(m[1], 16), l === 6 ? rgbn(m) // #ff0000
          : l === 3 ? new Rgb((m >> 8 & 0xf) | (m >> 4 & 0xf0), (m >> 4 & 0xf) | (m & 0xf0), ((m & 0xf) << 4) | (m & 0xf), 1) // #f00
          : l === 8 ? rgba(m >> 24 & 0xff, m >> 16 & 0xff, m >> 8 & 0xff, (m & 0xff) / 0xff) // #ff000000
          : l === 4 ? rgba((m >> 12 & 0xf) | (m >> 8 & 0xf0), (m >> 8 & 0xf) | (m >> 4 & 0xf0), (m >> 4 & 0xf) | (m & 0xf0), (((m & 0xf) << 4) | (m & 0xf)) / 0xff) // #f000
          : null) // invalid hex
          : (m = reRgbInteger.exec(format)) ? new Rgb(m[1], m[2], m[3], 1) // rgb(255, 0, 0)
          : (m = reRgbPercent.exec(format)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) // rgb(100%, 0%, 0%)
          : (m = reRgbaInteger.exec(format)) ? rgba(m[1], m[2], m[3], m[4]) // rgba(255, 0, 0, 1)
          : (m = reRgbaPercent.exec(format)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) // rgb(100%, 0%, 0%, 1)
          : (m = reHslPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) // hsl(120, 50%, 50%)
          : (m = reHslaPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) // hsla(120, 50%, 50%, 1)
          : named.hasOwnProperty(format) ? rgbn(named[format]) // eslint-disable-line no-prototype-builtins
          : format === "transparent" ? new Rgb(NaN, NaN, NaN, 0)
          : null;
    }

    function rgbn(n) {
      return new Rgb(n >> 16 & 0xff, n >> 8 & 0xff, n & 0xff, 1);
    }

    function rgba(r, g, b, a) {
      if (a <= 0) r = g = b = NaN;
      return new Rgb(r, g, b, a);
    }

    function rgbConvert(o) {
      if (!(o instanceof Color)) o = color(o);
      if (!o) return new Rgb;
      o = o.rgb();
      return new Rgb(o.r, o.g, o.b, o.opacity);
    }

    function rgb(r, g, b, opacity) {
      return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
    }

    function Rgb(r, g, b, opacity) {
      this.r = +r;
      this.g = +g;
      this.b = +b;
      this.opacity = +opacity;
    }

    define(Rgb, rgb, extend(Color, {
      brighter: function(k) {
        k = k == null ? brighter : Math.pow(brighter, k);
        return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
      },
      darker: function(k) {
        k = k == null ? darker : Math.pow(darker, k);
        return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
      },
      rgb: function() {
        return this;
      },
      displayable: function() {
        return (-0.5 <= this.r && this.r < 255.5)
            && (-0.5 <= this.g && this.g < 255.5)
            && (-0.5 <= this.b && this.b < 255.5)
            && (0 <= this.opacity && this.opacity <= 1);
      },
      hex: rgb_formatHex, // Deprecated! Use color.formatHex.
      formatHex: rgb_formatHex,
      formatRgb: rgb_formatRgb,
      toString: rgb_formatRgb
    }));

    function rgb_formatHex() {
      return "#" + hex(this.r) + hex(this.g) + hex(this.b);
    }

    function rgb_formatRgb() {
      var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
      return (a === 1 ? "rgb(" : "rgba(")
          + Math.max(0, Math.min(255, Math.round(this.r) || 0)) + ", "
          + Math.max(0, Math.min(255, Math.round(this.g) || 0)) + ", "
          + Math.max(0, Math.min(255, Math.round(this.b) || 0))
          + (a === 1 ? ")" : ", " + a + ")");
    }

    function hex(value) {
      value = Math.max(0, Math.min(255, Math.round(value) || 0));
      return (value < 16 ? "0" : "") + value.toString(16);
    }

    function hsla(h, s, l, a) {
      if (a <= 0) h = s = l = NaN;
      else if (l <= 0 || l >= 1) h = s = NaN;
      else if (s <= 0) h = NaN;
      return new Hsl(h, s, l, a);
    }

    function hslConvert(o) {
      if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
      if (!(o instanceof Color)) o = color(o);
      if (!o) return new Hsl;
      if (o instanceof Hsl) return o;
      o = o.rgb();
      var r = o.r / 255,
          g = o.g / 255,
          b = o.b / 255,
          min = Math.min(r, g, b),
          max = Math.max(r, g, b),
          h = NaN,
          s = max - min,
          l = (max + min) / 2;
      if (s) {
        if (r === max) h = (g - b) / s + (g < b) * 6;
        else if (g === max) h = (b - r) / s + 2;
        else h = (r - g) / s + 4;
        s /= l < 0.5 ? max + min : 2 - max - min;
        h *= 60;
      } else {
        s = l > 0 && l < 1 ? 0 : h;
      }
      return new Hsl(h, s, l, o.opacity);
    }

    function hsl(h, s, l, opacity) {
      return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
    }

    function Hsl(h, s, l, opacity) {
      this.h = +h;
      this.s = +s;
      this.l = +l;
      this.opacity = +opacity;
    }

    define(Hsl, hsl, extend(Color, {
      brighter: function(k) {
        k = k == null ? brighter : Math.pow(brighter, k);
        return new Hsl(this.h, this.s, this.l * k, this.opacity);
      },
      darker: function(k) {
        k = k == null ? darker : Math.pow(darker, k);
        return new Hsl(this.h, this.s, this.l * k, this.opacity);
      },
      rgb: function() {
        var h = this.h % 360 + (this.h < 0) * 360,
            s = isNaN(h) || isNaN(this.s) ? 0 : this.s,
            l = this.l,
            m2 = l + (l < 0.5 ? l : 1 - l) * s,
            m1 = 2 * l - m2;
        return new Rgb(
          hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2),
          hsl2rgb(h, m1, m2),
          hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2),
          this.opacity
        );
      },
      displayable: function() {
        return (0 <= this.s && this.s <= 1 || isNaN(this.s))
            && (0 <= this.l && this.l <= 1)
            && (0 <= this.opacity && this.opacity <= 1);
      },
      formatHsl: function() {
        var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
        return (a === 1 ? "hsl(" : "hsla(")
            + (this.h || 0) + ", "
            + (this.s || 0) * 100 + "%, "
            + (this.l || 0) * 100 + "%"
            + (a === 1 ? ")" : ", " + a + ")");
      }
    }));

    /* From FvD 13.37, CSS Color Module Level 3 */
    function hsl2rgb(h, m1, m2) {
      return (h < 60 ? m1 + (m2 - m1) * h / 60
          : h < 180 ? m2
          : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60
          : m1) * 255;
    }

    var constant = x => () => x;

    function linear(a, d) {
      return function(t) {
        return a + t * d;
      };
    }

    function exponential(a, b, y) {
      return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function(t) {
        return Math.pow(a + t * b, y);
      };
    }

    function gamma(y) {
      return (y = +y) === 1 ? nogamma : function(a, b) {
        return b - a ? exponential(a, b, y) : constant(isNaN(a) ? b : a);
      };
    }

    function nogamma(a, b) {
      var d = b - a;
      return d ? linear(a, d) : constant(isNaN(a) ? b : a);
    }

    var rgb$1 = (function rgbGamma(y) {
      var color = gamma(y);

      function rgb$1(start, end) {
        var r = color((start = rgb(start)).r, (end = rgb(end)).r),
            g = color(start.g, end.g),
            b = color(start.b, end.b),
            opacity = nogamma(start.opacity, end.opacity);
        return function(t) {
          start.r = r(t);
          start.g = g(t);
          start.b = b(t);
          start.opacity = opacity(t);
          return start + "";
        };
      }

      rgb$1.gamma = rgbGamma;

      return rgb$1;
    })(1);

    function numberArray(a, b) {
      if (!b) b = [];
      var n = a ? Math.min(b.length, a.length) : 0,
          c = b.slice(),
          i;
      return function(t) {
        for (i = 0; i < n; ++i) c[i] = a[i] * (1 - t) + b[i] * t;
        return c;
      };
    }

    function isNumberArray(x) {
      return ArrayBuffer.isView(x) && !(x instanceof DataView);
    }

    function genericArray(a, b) {
      var nb = b ? b.length : 0,
          na = a ? Math.min(nb, a.length) : 0,
          x = new Array(na),
          c = new Array(nb),
          i;

      for (i = 0; i < na; ++i) x[i] = interpolate(a[i], b[i]);
      for (; i < nb; ++i) c[i] = b[i];

      return function(t) {
        for (i = 0; i < na; ++i) c[i] = x[i](t);
        return c;
      };
    }

    function date(a, b) {
      var d = new Date;
      return a = +a, b = +b, function(t) {
        return d.setTime(a * (1 - t) + b * t), d;
      };
    }

    function interpolateNumber(a, b) {
      return a = +a, b = +b, function(t) {
        return a * (1 - t) + b * t;
      };
    }

    function object(a, b) {
      var i = {},
          c = {},
          k;

      if (a === null || typeof a !== "object") a = {};
      if (b === null || typeof b !== "object") b = {};

      for (k in b) {
        if (k in a) {
          i[k] = interpolate(a[k], b[k]);
        } else {
          c[k] = b[k];
        }
      }

      return function(t) {
        for (k in i) c[k] = i[k](t);
        return c;
      };
    }

    var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,
        reB = new RegExp(reA.source, "g");

    function zero(b) {
      return function() {
        return b;
      };
    }

    function one(b) {
      return function(t) {
        return b(t) + "";
      };
    }

    function string(a, b) {
      var bi = reA.lastIndex = reB.lastIndex = 0, // scan index for next number in b
          am, // current match in a
          bm, // current match in b
          bs, // string preceding current number in b, if any
          i = -1, // index in s
          s = [], // string constants and placeholders
          q = []; // number interpolators

      // Coerce inputs to strings.
      a = a + "", b = b + "";

      // Interpolate pairs of numbers in a & b.
      while ((am = reA.exec(a))
          && (bm = reB.exec(b))) {
        if ((bs = bm.index) > bi) { // a string precedes the next number in b
          bs = b.slice(bi, bs);
          if (s[i]) s[i] += bs; // coalesce with previous string
          else s[++i] = bs;
        }
        if ((am = am[0]) === (bm = bm[0])) { // numbers in a & b match
          if (s[i]) s[i] += bm; // coalesce with previous string
          else s[++i] = bm;
        } else { // interpolate non-matching numbers
          s[++i] = null;
          q.push({i: i, x: interpolateNumber(am, bm)});
        }
        bi = reB.lastIndex;
      }

      // Add remains of b.
      if (bi < b.length) {
        bs = b.slice(bi);
        if (s[i]) s[i] += bs; // coalesce with previous string
        else s[++i] = bs;
      }

      // Special optimization for only a single match.
      // Otherwise, interpolate each of the numbers and rejoin the string.
      return s.length < 2 ? (q[0]
          ? one(q[0].x)
          : zero(b))
          : (b = q.length, function(t) {
              for (var i = 0, o; i < b; ++i) s[(o = q[i]).i] = o.x(t);
              return s.join("");
            });
    }

    function interpolate(a, b) {
      var t = typeof b, c;
      return b == null || t === "boolean" ? constant(b)
          : (t === "number" ? interpolateNumber
          : t === "string" ? ((c = color(b)) ? (b = c, rgb$1) : string)
          : b instanceof color ? rgb$1
          : b instanceof Date ? date
          : isNumberArray(b) ? numberArray
          : Array.isArray(b) ? genericArray
          : typeof b.valueOf !== "function" && typeof b.toString !== "function" || isNaN(b) ? object
          : interpolateNumber)(a, b);
    }

    function interpolateRound(a, b) {
      return a = +a, b = +b, function(t) {
        return Math.round(a * (1 - t) + b * t);
      };
    }

    function constants(x) {
      return function() {
        return x;
      };
    }

    function number$1(x) {
      return +x;
    }

    var unit = [0, 1];

    function identity$1(x) {
      return x;
    }

    function normalize(a, b) {
      return (b -= (a = +a))
          ? function(x) { return (x - a) / b; }
          : constants(isNaN(b) ? NaN : 0.5);
    }

    function clamper(a, b) {
      var t;
      if (a > b) t = a, a = b, b = t;
      return function(x) { return Math.max(a, Math.min(b, x)); };
    }

    // normalize(a, b)(x) takes a domain value x in [a,b] and returns the corresponding parameter t in [0,1].
    // interpolate(a, b)(t) takes a parameter t in [0,1] and returns the corresponding range value x in [a,b].
    function bimap(domain, range, interpolate) {
      var d0 = domain[0], d1 = domain[1], r0 = range[0], r1 = range[1];
      if (d1 < d0) d0 = normalize(d1, d0), r0 = interpolate(r1, r0);
      else d0 = normalize(d0, d1), r0 = interpolate(r0, r1);
      return function(x) { return r0(d0(x)); };
    }

    function polymap(domain, range, interpolate) {
      var j = Math.min(domain.length, range.length) - 1,
          d = new Array(j),
          r = new Array(j),
          i = -1;

      // Reverse descending domains.
      if (domain[j] < domain[0]) {
        domain = domain.slice().reverse();
        range = range.slice().reverse();
      }

      while (++i < j) {
        d[i] = normalize(domain[i], domain[i + 1]);
        r[i] = interpolate(range[i], range[i + 1]);
      }

      return function(x) {
        var i = bisectRight(domain, x, 1, j) - 1;
        return r[i](d[i](x));
      };
    }

    function copy(source, target) {
      return target
          .domain(source.domain())
          .range(source.range())
          .interpolate(source.interpolate())
          .clamp(source.clamp())
          .unknown(source.unknown());
    }

    function transformer() {
      var domain = unit,
          range = unit,
          interpolate$1 = interpolate,
          transform,
          untransform,
          unknown,
          clamp = identity$1,
          piecewise,
          output,
          input;

      function rescale() {
        var n = Math.min(domain.length, range.length);
        if (clamp !== identity$1) clamp = clamper(domain[0], domain[n - 1]);
        piecewise = n > 2 ? polymap : bimap;
        output = input = null;
        return scale;
      }

      function scale(x) {
        return isNaN(x = +x) ? unknown : (output || (output = piecewise(domain.map(transform), range, interpolate$1)))(transform(clamp(x)));
      }

      scale.invert = function(y) {
        return clamp(untransform((input || (input = piecewise(range, domain.map(transform), interpolateNumber)))(y)));
      };

      scale.domain = function(_) {
        return arguments.length ? (domain = Array.from(_, number$1), rescale()) : domain.slice();
      };

      scale.range = function(_) {
        return arguments.length ? (range = Array.from(_), rescale()) : range.slice();
      };

      scale.rangeRound = function(_) {
        return range = Array.from(_), interpolate$1 = interpolateRound, rescale();
      };

      scale.clamp = function(_) {
        return arguments.length ? (clamp = _ ? true : identity$1, rescale()) : clamp !== identity$1;
      };

      scale.interpolate = function(_) {
        return arguments.length ? (interpolate$1 = _, rescale()) : interpolate$1;
      };

      scale.unknown = function(_) {
        return arguments.length ? (unknown = _, scale) : unknown;
      };

      return function(t, u) {
        transform = t, untransform = u;
        return rescale();
      };
    }

    function continuous() {
      return transformer()(identity$1, identity$1);
    }

    function formatDecimal(x) {
      return Math.abs(x = Math.round(x)) >= 1e21
          ? x.toLocaleString("en").replace(/,/g, "")
          : x.toString(10);
    }

    // Computes the decimal coefficient and exponent of the specified number x with
    // significant digits p, where x is positive and p is in [1, 21] or undefined.
    // For example, formatDecimalParts(1.23) returns ["123", 0].
    function formatDecimalParts(x, p) {
      if ((i = (x = p ? x.toExponential(p - 1) : x.toExponential()).indexOf("e")) < 0) return null; // NaN, ±Infinity
      var i, coefficient = x.slice(0, i);

      // The string returned by toExponential either has the form \d\.\d+e[-+]\d+
      // (e.g., 1.2e+3) or the form \de[-+]\d+ (e.g., 1e+3).
      return [
        coefficient.length > 1 ? coefficient[0] + coefficient.slice(2) : coefficient,
        +x.slice(i + 1)
      ];
    }

    function exponent(x) {
      return x = formatDecimalParts(Math.abs(x)), x ? x[1] : NaN;
    }

    function formatGroup(grouping, thousands) {
      return function(value, width) {
        var i = value.length,
            t = [],
            j = 0,
            g = grouping[0],
            length = 0;

        while (i > 0 && g > 0) {
          if (length + g + 1 > width) g = Math.max(1, width - length);
          t.push(value.substring(i -= g, i + g));
          if ((length += g + 1) > width) break;
          g = grouping[j = (j + 1) % grouping.length];
        }

        return t.reverse().join(thousands);
      };
    }

    function formatNumerals(numerals) {
      return function(value) {
        return value.replace(/[0-9]/g, function(i) {
          return numerals[+i];
        });
      };
    }

    // [[fill]align][sign][symbol][0][width][,][.precision][~][type]
    var re = /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;

    function formatSpecifier(specifier) {
      if (!(match = re.exec(specifier))) throw new Error("invalid format: " + specifier);
      var match;
      return new FormatSpecifier({
        fill: match[1],
        align: match[2],
        sign: match[3],
        symbol: match[4],
        zero: match[5],
        width: match[6],
        comma: match[7],
        precision: match[8] && match[8].slice(1),
        trim: match[9],
        type: match[10]
      });
    }

    formatSpecifier.prototype = FormatSpecifier.prototype; // instanceof

    function FormatSpecifier(specifier) {
      this.fill = specifier.fill === undefined ? " " : specifier.fill + "";
      this.align = specifier.align === undefined ? ">" : specifier.align + "";
      this.sign = specifier.sign === undefined ? "-" : specifier.sign + "";
      this.symbol = specifier.symbol === undefined ? "" : specifier.symbol + "";
      this.zero = !!specifier.zero;
      this.width = specifier.width === undefined ? undefined : +specifier.width;
      this.comma = !!specifier.comma;
      this.precision = specifier.precision === undefined ? undefined : +specifier.precision;
      this.trim = !!specifier.trim;
      this.type = specifier.type === undefined ? "" : specifier.type + "";
    }

    FormatSpecifier.prototype.toString = function() {
      return this.fill
          + this.align
          + this.sign
          + this.symbol
          + (this.zero ? "0" : "")
          + (this.width === undefined ? "" : Math.max(1, this.width | 0))
          + (this.comma ? "," : "")
          + (this.precision === undefined ? "" : "." + Math.max(0, this.precision | 0))
          + (this.trim ? "~" : "")
          + this.type;
    };

    // Trims insignificant zeros, e.g., replaces 1.2000k with 1.2k.
    function formatTrim(s) {
      out: for (var n = s.length, i = 1, i0 = -1, i1; i < n; ++i) {
        switch (s[i]) {
          case ".": i0 = i1 = i; break;
          case "0": if (i0 === 0) i0 = i; i1 = i; break;
          default: if (!+s[i]) break out; if (i0 > 0) i0 = 0; break;
        }
      }
      return i0 > 0 ? s.slice(0, i0) + s.slice(i1 + 1) : s;
    }

    var prefixExponent;

    function formatPrefixAuto(x, p) {
      var d = formatDecimalParts(x, p);
      if (!d) return x + "";
      var coefficient = d[0],
          exponent = d[1],
          i = exponent - (prefixExponent = Math.max(-8, Math.min(8, Math.floor(exponent / 3))) * 3) + 1,
          n = coefficient.length;
      return i === n ? coefficient
          : i > n ? coefficient + new Array(i - n + 1).join("0")
          : i > 0 ? coefficient.slice(0, i) + "." + coefficient.slice(i)
          : "0." + new Array(1 - i).join("0") + formatDecimalParts(x, Math.max(0, p + i - 1))[0]; // less than 1y!
    }

    function formatRounded(x, p) {
      var d = formatDecimalParts(x, p);
      if (!d) return x + "";
      var coefficient = d[0],
          exponent = d[1];
      return exponent < 0 ? "0." + new Array(-exponent).join("0") + coefficient
          : coefficient.length > exponent + 1 ? coefficient.slice(0, exponent + 1) + "." + coefficient.slice(exponent + 1)
          : coefficient + new Array(exponent - coefficient.length + 2).join("0");
    }

    var formatTypes = {
      "%": (x, p) => (x * 100).toFixed(p),
      "b": (x) => Math.round(x).toString(2),
      "c": (x) => x + "",
      "d": formatDecimal,
      "e": (x, p) => x.toExponential(p),
      "f": (x, p) => x.toFixed(p),
      "g": (x, p) => x.toPrecision(p),
      "o": (x) => Math.round(x).toString(8),
      "p": (x, p) => formatRounded(x * 100, p),
      "r": formatRounded,
      "s": formatPrefixAuto,
      "X": (x) => Math.round(x).toString(16).toUpperCase(),
      "x": (x) => Math.round(x).toString(16)
    };

    function identity$2(x) {
      return x;
    }

    var map = Array.prototype.map,
        prefixes = ["y","z","a","f","p","n","µ","m","","k","M","G","T","P","E","Z","Y"];

    function formatLocale(locale) {
      var group = locale.grouping === undefined || locale.thousands === undefined ? identity$2 : formatGroup(map.call(locale.grouping, Number), locale.thousands + ""),
          currencyPrefix = locale.currency === undefined ? "" : locale.currency[0] + "",
          currencySuffix = locale.currency === undefined ? "" : locale.currency[1] + "",
          decimal = locale.decimal === undefined ? "." : locale.decimal + "",
          numerals = locale.numerals === undefined ? identity$2 : formatNumerals(map.call(locale.numerals, String)),
          percent = locale.percent === undefined ? "%" : locale.percent + "",
          minus = locale.minus === undefined ? "−" : locale.minus + "",
          nan = locale.nan === undefined ? "NaN" : locale.nan + "";

      function newFormat(specifier) {
        specifier = formatSpecifier(specifier);

        var fill = specifier.fill,
            align = specifier.align,
            sign = specifier.sign,
            symbol = specifier.symbol,
            zero = specifier.zero,
            width = specifier.width,
            comma = specifier.comma,
            precision = specifier.precision,
            trim = specifier.trim,
            type = specifier.type;

        // The "n" type is an alias for ",g".
        if (type === "n") comma = true, type = "g";

        // The "" type, and any invalid type, is an alias for ".12~g".
        else if (!formatTypes[type]) precision === undefined && (precision = 12), trim = true, type = "g";

        // If zero fill is specified, padding goes after sign and before digits.
        if (zero || (fill === "0" && align === "=")) zero = true, fill = "0", align = "=";

        // Compute the prefix and suffix.
        // For SI-prefix, the suffix is lazily computed.
        var prefix = symbol === "$" ? currencyPrefix : symbol === "#" && /[boxX]/.test(type) ? "0" + type.toLowerCase() : "",
            suffix = symbol === "$" ? currencySuffix : /[%p]/.test(type) ? percent : "";

        // What format function should we use?
        // Is this an integer type?
        // Can this type generate exponential notation?
        var formatType = formatTypes[type],
            maybeSuffix = /[defgprs%]/.test(type);

        // Set the default precision if not specified,
        // or clamp the specified precision to the supported range.
        // For significant precision, it must be in [1, 21].
        // For fixed precision, it must be in [0, 20].
        precision = precision === undefined ? 6
            : /[gprs]/.test(type) ? Math.max(1, Math.min(21, precision))
            : Math.max(0, Math.min(20, precision));

        function format(value) {
          var valuePrefix = prefix,
              valueSuffix = suffix,
              i, n, c;

          if (type === "c") {
            valueSuffix = formatType(value) + valueSuffix;
            value = "";
          } else {
            value = +value;

            // Determine the sign. -0 is not less than 0, but 1 / -0 is!
            var valueNegative = value < 0 || 1 / value < 0;

            // Perform the initial formatting.
            value = isNaN(value) ? nan : formatType(Math.abs(value), precision);

            // Trim insignificant zeros.
            if (trim) value = formatTrim(value);

            // If a negative value rounds to zero after formatting, and no explicit positive sign is requested, hide the sign.
            if (valueNegative && +value === 0 && sign !== "+") valueNegative = false;

            // Compute the prefix and suffix.
            valuePrefix = (valueNegative ? (sign === "(" ? sign : minus) : sign === "-" || sign === "(" ? "" : sign) + valuePrefix;
            valueSuffix = (type === "s" ? prefixes[8 + prefixExponent / 3] : "") + valueSuffix + (valueNegative && sign === "(" ? ")" : "");

            // Break the formatted value into the integer “value” part that can be
            // grouped, and fractional or exponential “suffix” part that is not.
            if (maybeSuffix) {
              i = -1, n = value.length;
              while (++i < n) {
                if (c = value.charCodeAt(i), 48 > c || c > 57) {
                  valueSuffix = (c === 46 ? decimal + value.slice(i + 1) : value.slice(i)) + valueSuffix;
                  value = value.slice(0, i);
                  break;
                }
              }
            }
          }

          // If the fill character is not "0", grouping is applied before padding.
          if (comma && !zero) value = group(value, Infinity);

          // Compute the padding.
          var length = valuePrefix.length + value.length + valueSuffix.length,
              padding = length < width ? new Array(width - length + 1).join(fill) : "";

          // If the fill character is "0", grouping is applied after padding.
          if (comma && zero) value = group(padding + value, padding.length ? width - valueSuffix.length : Infinity), padding = "";

          // Reconstruct the final output based on the desired alignment.
          switch (align) {
            case "<": value = valuePrefix + value + valueSuffix + padding; break;
            case "=": value = valuePrefix + padding + value + valueSuffix; break;
            case "^": value = padding.slice(0, length = padding.length >> 1) + valuePrefix + value + valueSuffix + padding.slice(length); break;
            default: value = padding + valuePrefix + value + valueSuffix; break;
          }

          return numerals(value);
        }

        format.toString = function() {
          return specifier + "";
        };

        return format;
      }

      function formatPrefix(specifier, value) {
        var f = newFormat((specifier = formatSpecifier(specifier), specifier.type = "f", specifier)),
            e = Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3,
            k = Math.pow(10, -e),
            prefix = prefixes[8 + e / 3];
        return function(value) {
          return f(k * value) + prefix;
        };
      }

      return {
        format: newFormat,
        formatPrefix: formatPrefix
      };
    }

    var locale;
    var format;
    var formatPrefix;

    defaultLocale({
      thousands: ",",
      grouping: [3],
      currency: ["$", ""]
    });

    function defaultLocale(definition) {
      locale = formatLocale(definition);
      format = locale.format;
      formatPrefix = locale.formatPrefix;
      return locale;
    }

    function precisionFixed(step) {
      return Math.max(0, -exponent(Math.abs(step)));
    }

    function precisionPrefix(step, value) {
      return Math.max(0, Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3 - exponent(Math.abs(step)));
    }

    function precisionRound(step, max) {
      step = Math.abs(step), max = Math.abs(max) - step;
      return Math.max(0, exponent(max) - exponent(step)) + 1;
    }

    function tickFormat(start, stop, count, specifier) {
      var step = tickStep(start, stop, count),
          precision;
      specifier = formatSpecifier(specifier == null ? ",f" : specifier);
      switch (specifier.type) {
        case "s": {
          var value = Math.max(Math.abs(start), Math.abs(stop));
          if (specifier.precision == null && !isNaN(precision = precisionPrefix(step, value))) specifier.precision = precision;
          return formatPrefix(specifier, value);
        }
        case "":
        case "e":
        case "g":
        case "p":
        case "r": {
          if (specifier.precision == null && !isNaN(precision = precisionRound(step, Math.max(Math.abs(start), Math.abs(stop))))) specifier.precision = precision - (specifier.type === "e");
          break;
        }
        case "f":
        case "%": {
          if (specifier.precision == null && !isNaN(precision = precisionFixed(step))) specifier.precision = precision - (specifier.type === "%") * 2;
          break;
        }
      }
      return format(specifier);
    }

    function linearish(scale) {
      var domain = scale.domain;

      scale.ticks = function(count) {
        var d = domain();
        return ticks(d[0], d[d.length - 1], count == null ? 10 : count);
      };

      scale.tickFormat = function(count, specifier) {
        var d = domain();
        return tickFormat(d[0], d[d.length - 1], count == null ? 10 : count, specifier);
      };

      scale.nice = function(count) {
        if (count == null) count = 10;

        var d = domain();
        var i0 = 0;
        var i1 = d.length - 1;
        var start = d[i0];
        var stop = d[i1];
        var prestep;
        var step;
        var maxIter = 10;

        if (stop < start) {
          step = start, start = stop, stop = step;
          step = i0, i0 = i1, i1 = step;
        }
        
        while (maxIter-- > 0) {
          step = tickIncrement(start, stop, count);
          if (step === prestep) {
            d[i0] = start;
            d[i1] = stop;
            return domain(d);
          } else if (step > 0) {
            start = Math.floor(start / step) * step;
            stop = Math.ceil(stop / step) * step;
          } else if (step < 0) {
            start = Math.ceil(start * step) / step;
            stop = Math.floor(stop * step) / step;
          } else {
            break;
          }
          prestep = step;
        }

        return scale;
      };

      return scale;
    }

    function linear$1() {
      var scale = continuous();

      scale.copy = function() {
        return copy(scale, linear$1());
      };

      initRange.apply(scale, arguments);

      return linearish(scale);
    }

    function transformPow(exponent) {
      return function(x) {
        return x < 0 ? -Math.pow(-x, exponent) : Math.pow(x, exponent);
      };
    }

    function transformSqrt(x) {
      return x < 0 ? -Math.sqrt(-x) : Math.sqrt(x);
    }

    function transformSquare(x) {
      return x < 0 ? -x * x : x * x;
    }

    function powish(transform) {
      var scale = transform(identity$1, identity$1),
          exponent = 1;

      function rescale() {
        return exponent === 1 ? transform(identity$1, identity$1)
            : exponent === 0.5 ? transform(transformSqrt, transformSquare)
            : transform(transformPow(exponent), transformPow(1 / exponent));
      }

      scale.exponent = function(_) {
        return arguments.length ? (exponent = +_, rescale()) : exponent;
      };

      return linearish(scale);
    }

    function pow() {
      var scale = powish(transformer());

      scale.copy = function() {
        return copy(scale, pow()).exponent(scale.exponent());
      };

      initRange.apply(scale, arguments);

      return scale;
    }

    function sqrt() {
      return pow.apply(null, arguments).exponent(0.5);
    }

    var defaultScales = {
    	x: linear$1,
    	y: linear$1,
    	z: linear$1,
    	r: sqrt
    };

    /* --------------------------------------------
     *
     * Determine whether a scale is a log, symlog, power or other
     * This is not meant to be exhaustive of all the different types of
     * scales in d3-scale and focuses on continuous scales
     *
     * --------------------------------------------
     */
    function findScaleType(scale) {
    	if (scale.constant) {
    		return 'symlog';
    	}
    	if (scale.base) {
    		return 'log';
    	}
    	if (scale.exponent) {
    		if (scale.exponent() === 0.5) {
    			return 'sqrt';
    		}
    		return 'pow';
    	}
    	return 'other';
    }

    function identity$3 (d) {
    	return d;
    }

    function log(sign) {
    	return x => Math.log(sign * x);
    }

    function exp(sign) {
    	return x => sign * Math.exp(x);
    }

    function symlog(c) {
    	return x => Math.sign(x) * Math.log1p(Math.abs(x / c));
    }

    function symexp(c) {
    	return x => Math.sign(x) * Math.expm1(Math.abs(x)) * c;
    }

    function pow$1(exponent) {
    	return function powFn(x) {
    		return x < 0 ? -Math.pow(-x, exponent) : Math.pow(x, exponent);
    	};
    }

    function getPadFunctions(scale) {
    	const scaleType = findScaleType(scale);

    	if (scaleType === 'log') {
    		const sign = Math.sign(scale.domain()[0]);
    		return { lift: log(sign), ground: exp(sign), scaleType };
    	}
    	if (scaleType === 'pow') {
    		const exponent = 1;
    		return { lift: pow$1(exponent), ground: pow$1(1 / exponent), scaleType };
    	}
    	if (scaleType === 'sqrt') {
    		const exponent = 0.5;
    		return { lift: pow$1(exponent), ground: pow$1(1 / exponent), scaleType };
    	}
    	if (scaleType === 'symlog') {
    		const constant = 1;
    		return { lift: symlog(constant), ground: symexp(constant), scaleType };
    	}

    	return { lift: identity$3, ground: identity$3, scaleType };
    }

    /* --------------------------------------------
     *
     * Returns a modified scale domain by in/decreasing
     * the min/max by taking the desired difference
     * in pixels and converting it to units of data.
     * Returns an array that you can set as the new domain.
     * Padding contributed by @veltman.
     * See here for discussion of transforms: https://github.com/d3/d3-scale/issues/150
     *
     * --------------------------------------------
     */

    function padScale (scale, padding) {
    	if (typeof scale.range !== 'function') {
    		throw new Error('Scale method `range` must be a function');
    	}
    	if (typeof scale.domain !== 'function') {
    		throw new Error('Scale method `domain` must be a function');
    	}
    	if (!Array.isArray(padding)) {
    		return scale.domain();
    	}

    	if (scale.domain().length !== 2) {
    		console.warn('[LayerCake] The scale is expected to have a domain of length 2 to use padding. Are you sure you want to use padding? Your scale\'s domain is:', scale.domain());
    	}
    	if (scale.range().length !== 2) {
    		console.warn('[LayerCake] The scale is expected to have a range of length 2 to use padding. Are you sure you want to use padding? Your scale\'s range is:', scale.range());
    	}

    	const { lift, ground } = getPadFunctions(scale);

    	const d0 = scale.domain()[0];

    	const isTime = Object.prototype.toString.call(d0) === '[object Date]';

    	const [d1, d2] = scale.domain().map(d => {
    		return isTime ? lift(d.getTime()) : lift(d);
    	});
    	const [r1, r2] = scale.range();
    	const paddingLeft = padding[0] || 0;
    	const paddingRight = padding[1] || 0;

    	const step = (d2 - d1) / (Math.abs(r2 - r1) - paddingLeft - paddingRight); // Math.abs() to properly handle reversed scales

    	return [d1 - paddingLeft * step, paddingRight * step + d2].map(d => {
    		return isTime ? ground(new Date(d)) : ground(d);
    	});
    }

    /* eslint-disable no-nested-ternary */
    function calcBaseRange(s, width, height, reverse, percentRange) {
    	let min;
    	let max;
    	if (percentRange === true) {
    		min = 0;
    		max = 100;
    	} else {
    		min = s === 'r' ? 1 : 0;
    		max = s === 'y' ? height : s === 'r' ? 25 : width;
    	}
    	return reverse === true ? [max, min] : [min, max];
    }

    function getDefaultRange(s, width, height, reverse, range, percentRange) {
    	return !range
    		? calcBaseRange(s, width, height, reverse, percentRange)
    		: typeof range === 'function'
    			? range({ width, height })
    			: range;
    }

    function createScale (s) {
    	return function scaleCreator ([$scale, $extents, $domain, $padding, $nice, $reverse, $width, $height, $range, $percentScale]) {
    		if ($extents === null) {
    			return null;
    		}

    		const defaultRange = getDefaultRange(s, $width, $height, $reverse, $range, $percentScale);

    		const scale = $scale === defaultScales[s] ? $scale() : $scale.copy();

    		/* --------------------------------------------
    		 * On creation, `$domain` will already have any nulls filled in
    		 * But if we set it via the context it might not, so rerun it through partialDomain
    		 */
    		scale
    			.domain(partialDomain($extents[s], $domain))
    			.range(defaultRange);

    		if ($padding) {
    			scale.domain(padScale(scale, $padding));
    		}

    		if ($nice === true) {
    			if (typeof scale.nice === 'function') {
    				scale.nice();
    			} else {
    				console.error(`[Layer Cake] You set \`${s}Nice: true\` but the ${s}Scale does not have a \`.nice\` method. Ignoring...`);
    			}
    		}

    		return scale;
    	};
    }

    function createGetter ([$acc, $scale]) {
    	return d => {
    		const val = $acc(d);
    		if (Array.isArray(val)) {
    			return val.map(v => $scale(v));
    		}
    		return $scale(val);
    	};
    }

    function getRange([$scale]) {
    	if (typeof $scale === 'function') {
    		if (typeof $scale.range === 'function') {
    			return $scale.range();
    		}
    		console.error('[LayerCake] Your scale doesn\'t have a `.range` method?');
    	}
    	return null;
    }

    var defaultReverses = {
    	x: false,
    	y: true,
    	z: false,
    	r: false
    };

    /* node_modules\layercake\src\LayerCake.svelte generated by Svelte v3.44.1 */

    const { Object: Object_1, console: console_1 } = globals;
    const file$b = "node_modules\\layercake\\src\\LayerCake.svelte";

    const get_default_slot_changes = dirty => ({
    	width: dirty[0] & /*$width_d*/ 32,
    	height: dirty[0] & /*$height_d*/ 64,
    	aspectRatio: dirty[0] & /*$aspectRatio_d*/ 128,
    	containerWidth: dirty[0] & /*$_containerWidth*/ 256,
    	containerHeight: dirty[0] & /*$_containerHeight*/ 512
    });

    const get_default_slot_context = ctx => ({
    	width: /*$width_d*/ ctx[5],
    	height: /*$height_d*/ ctx[6],
    	aspectRatio: /*$aspectRatio_d*/ ctx[7],
    	containerWidth: /*$_containerWidth*/ ctx[8],
    	containerHeight: /*$_containerHeight*/ ctx[9]
    });

    // (294:0) {#if (ssr === true || typeof window !== 'undefined')}
    function create_if_block$4(ctx) {
    	let div;
    	let div_style_value;
    	let div_resize_listener;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[53].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[52], get_default_slot_context);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "layercake-container svelte-vhzpsp");

    			attr_dev(div, "style", div_style_value = "position:" + /*position*/ ctx[4] + "; " + (/*position*/ ctx[4] === 'absolute'
    			? 'top:0;right:0;bottom:0;left:0;'
    			: '') + " " + (/*pointerEvents*/ ctx[3] === false
    			? 'pointer-events:none;'
    			: '') + "");

    			add_render_callback(() => /*div_elementresize_handler*/ ctx[54].call(div));
    			add_location(div, file$b, 294, 1, 9534);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			div_resize_listener = add_resize_listener(div, /*div_elementresize_handler*/ ctx[54].bind(div));
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[0] & /*$width_d, $height_d, $aspectRatio_d, $_containerWidth, $_containerHeight*/ 992 | dirty[1] & /*$$scope*/ 2097152)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[52],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[52])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[52], dirty, get_default_slot_changes),
    						get_default_slot_context
    					);
    				}
    			}

    			if (!current || dirty[0] & /*position, pointerEvents*/ 24 && div_style_value !== (div_style_value = "position:" + /*position*/ ctx[4] + "; " + (/*position*/ ctx[4] === 'absolute'
    			? 'top:0;right:0;bottom:0;left:0;'
    			: '') + " " + (/*pointerEvents*/ ctx[3] === false
    			? 'pointer-events:none;'
    			: '') + "")) {
    				attr_dev(div, "style", div_style_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			div_resize_listener();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(294:0) {#if (ssr === true || typeof window !== 'undefined')}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = (/*ssr*/ ctx[2] === true || typeof window !== 'undefined') && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*ssr*/ ctx[2] === true || typeof window !== 'undefined') {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*ssr*/ 4) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let context;
    	let $width_d;
    	let $height_d;
    	let $aspectRatio_d;
    	let $_containerWidth;
    	let $_containerHeight;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('LayerCake', slots, ['default']);
    	let { ssr = false } = $$props;
    	let { pointerEvents = true } = $$props;
    	let { position = 'relative' } = $$props;
    	let { percentRange = false } = $$props;
    	let { width = undefined } = $$props;
    	let { height = undefined } = $$props;
    	let { containerWidth = width || 100 } = $$props;
    	let { containerHeight = height || 100 } = $$props;
    	let { x = undefined } = $$props;
    	let { y = undefined } = $$props;
    	let { z = undefined } = $$props;
    	let { r = undefined } = $$props;
    	let { custom = {} } = $$props;
    	let { data = [] } = $$props;
    	let { xDomain = undefined } = $$props;
    	let { yDomain = undefined } = $$props;
    	let { zDomain = undefined } = $$props;
    	let { rDomain = undefined } = $$props;
    	let { xNice = false } = $$props;
    	let { yNice = false } = $$props;
    	let { zNice = false } = $$props;
    	let { rNice = false } = $$props;
    	let { xReverse = defaultReverses.x } = $$props;
    	let { yReverse = defaultReverses.y } = $$props;
    	let { zReverse = defaultReverses.z } = $$props;
    	let { rReverse = defaultReverses.r } = $$props;
    	let { xPadding = undefined } = $$props;
    	let { yPadding = undefined } = $$props;
    	let { zPadding = undefined } = $$props;
    	let { rPadding = undefined } = $$props;
    	let { xScale = defaultScales.x } = $$props;
    	let { yScale = defaultScales.y } = $$props;
    	let { zScale = defaultScales.y } = $$props;
    	let { rScale = defaultScales.r } = $$props;
    	let { xRange = undefined } = $$props;
    	let { yRange = undefined } = $$props;
    	let { zRange = undefined } = $$props;
    	let { rRange = undefined } = $$props;
    	let { padding = {} } = $$props;
    	let { extents = {} } = $$props;
    	let { flatData = undefined } = $$props;

    	/* --------------------------------------------
     * Preserve a copy of our passed in settings before we modify them
     * Return this to the user's context so they can reference things if need be
     * Add the active keys since those aren't on our settings object.
     * This is mostly an escape-hatch
     */
    	const config = {};

    	/* --------------------------------------------
     * Make store versions of each parameter
     * Prefix these with `_` to keep things organized
     */
    	const _percentRange = writable();

    	const _containerWidth = writable();
    	validate_store(_containerWidth, '_containerWidth');
    	component_subscribe($$self, _containerWidth, value => $$invalidate(8, $_containerWidth = value));
    	const _containerHeight = writable();
    	validate_store(_containerHeight, '_containerHeight');
    	component_subscribe($$self, _containerHeight, value => $$invalidate(9, $_containerHeight = value));
    	const _x = writable();
    	const _y = writable();
    	const _z = writable();
    	const _r = writable();
    	const _custom = writable();
    	const _data = writable();
    	const _xDomain = writable();
    	const _yDomain = writable();
    	const _zDomain = writable();
    	const _rDomain = writable();
    	const _xNice = writable();
    	const _yNice = writable();
    	const _zNice = writable();
    	const _rNice = writable();
    	const _xReverse = writable();
    	const _yReverse = writable();
    	const _zReverse = writable();
    	const _rReverse = writable();
    	const _xPadding = writable();
    	const _yPadding = writable();
    	const _zPadding = writable();
    	const _rPadding = writable();
    	const _xScale = writable();
    	const _yScale = writable();
    	const _zScale = writable();
    	const _rScale = writable();
    	const _xRange = writable();
    	const _yRange = writable();
    	const _zRange = writable();
    	const _rRange = writable();
    	const _padding = writable();
    	const _flatData = writable();
    	const _extents = writable();
    	const _config = writable(config);

    	/* --------------------------------------------
     * Create derived values
     * Suffix these with `_d`
     */
    	const activeGetters_d = derived([_x, _y, _z, _r], ([$x, $y, $z, $r]) => {
    		return [
    			{ field: 'x', accessor: $x },
    			{ field: 'y', accessor: $y },
    			{ field: 'z', accessor: $z },
    			{ field: 'r', accessor: $r }
    		].filter(d => d.accessor);
    	});

    	const padding_d = derived([_padding, _containerWidth, _containerHeight], ([$padding]) => {
    		const defaultPadding = { top: 0, right: 0, bottom: 0, left: 0 };
    		return Object.assign(defaultPadding, $padding);
    	});

    	const box_d = derived([_containerWidth, _containerHeight, padding_d], ([$containerWidth, $containerHeight, $padding]) => {
    		const b = {};
    		b.top = $padding.top;
    		b.right = $containerWidth - $padding.right;
    		b.bottom = $containerHeight - $padding.bottom;
    		b.left = $padding.left;
    		b.width = b.right - b.left;
    		b.height = b.bottom - b.top;

    		if (b.width < 0 && b.height < 0) {
    			console.error('[LayerCake] Target div has negative width and height. Did you forget to set a width or height on the container?');
    		} else if (b.width < 0) {
    			console.error('[LayerCake] Target div has a negative width. Did you forget to set that CSS on the container?');
    		} else if (b.height < 0) {
    			console.error('[LayerCake] Target div has negative height. Did you forget to set that CSS on the container?');
    		}

    		return b;
    	});

    	const width_d = derived([box_d], ([$box]) => {
    		return $box.width;
    	});

    	validate_store(width_d, 'width_d');
    	component_subscribe($$self, width_d, value => $$invalidate(5, $width_d = value));

    	const height_d = derived([box_d], ([$box]) => {
    		return $box.height;
    	});

    	validate_store(height_d, 'height_d');
    	component_subscribe($$self, height_d, value => $$invalidate(6, $height_d = value));

    	/* --------------------------------------------
     * Calculate extents by taking the extent of the data
     * and filling that in with anything set by the user
     */
    	const extents_d = derived([_flatData, activeGetters_d, _extents], ([$flatData, $activeGetters, $extents]) => {
    		return {
    			...calcExtents($flatData, $activeGetters.filter(d => !$extents[d.field])),
    			...$extents
    		};
    	});

    	const xDomain_d = derived([extents_d, _xDomain], calcDomain('x'));
    	const yDomain_d = derived([extents_d, _yDomain], calcDomain('y'));
    	const zDomain_d = derived([extents_d, _zDomain], calcDomain('z'));
    	const rDomain_d = derived([extents_d, _rDomain], calcDomain('r'));

    	const xScale_d = derived(
    		[
    			_xScale,
    			extents_d,
    			xDomain_d,
    			_xPadding,
    			_xNice,
    			_xReverse,
    			width_d,
    			height_d,
    			_xRange,
    			_percentRange
    		],
    		createScale('x')
    	);

    	const xGet_d = derived([_x, xScale_d], createGetter);

    	const yScale_d = derived(
    		[
    			_yScale,
    			extents_d,
    			yDomain_d,
    			_yPadding,
    			_yNice,
    			_yReverse,
    			width_d,
    			height_d,
    			_yRange,
    			_percentRange
    		],
    		createScale('y')
    	);

    	const yGet_d = derived([_y, yScale_d], createGetter);

    	const zScale_d = derived(
    		[
    			_zScale,
    			extents_d,
    			zDomain_d,
    			_zPadding,
    			_zNice,
    			_zReverse,
    			width_d,
    			height_d,
    			_zRange,
    			_percentRange
    		],
    		createScale('z')
    	);

    	const zGet_d = derived([_z, zScale_d], createGetter);

    	const rScale_d = derived(
    		[
    			_rScale,
    			extents_d,
    			rDomain_d,
    			_rPadding,
    			_rNice,
    			_rReverse,
    			width_d,
    			height_d,
    			_rRange,
    			_percentRange
    		],
    		createScale('r')
    	);

    	const rGet_d = derived([_r, rScale_d], createGetter);
    	const xRange_d = derived([xScale_d], getRange);
    	const yRange_d = derived([yScale_d], getRange);
    	const zRange_d = derived([zScale_d], getRange);
    	const rRange_d = derived([rScale_d], getRange);

    	const aspectRatio_d = derived([width_d, height_d], ([$aspectRatio, $width, $height]) => {
    		return $width / $height;
    	});

    	validate_store(aspectRatio_d, 'aspectRatio_d');
    	component_subscribe($$self, aspectRatio_d, value => $$invalidate(7, $aspectRatio_d = value));

    	const writable_props = [
    		'ssr',
    		'pointerEvents',
    		'position',
    		'percentRange',
    		'width',
    		'height',
    		'containerWidth',
    		'containerHeight',
    		'x',
    		'y',
    		'z',
    		'r',
    		'custom',
    		'data',
    		'xDomain',
    		'yDomain',
    		'zDomain',
    		'rDomain',
    		'xNice',
    		'yNice',
    		'zNice',
    		'rNice',
    		'xReverse',
    		'yReverse',
    		'zReverse',
    		'rReverse',
    		'xPadding',
    		'yPadding',
    		'zPadding',
    		'rPadding',
    		'xScale',
    		'yScale',
    		'zScale',
    		'rScale',
    		'xRange',
    		'yRange',
    		'zRange',
    		'rRange',
    		'padding',
    		'extents',
    		'flatData'
    	];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<LayerCake> was created with unknown prop '${key}'`);
    	});

    	function div_elementresize_handler() {
    		containerWidth = this.clientWidth;
    		containerHeight = this.clientHeight;
    		$$invalidate(0, containerWidth);
    		$$invalidate(1, containerHeight);
    	}

    	$$self.$$set = $$props => {
    		if ('ssr' in $$props) $$invalidate(2, ssr = $$props.ssr);
    		if ('pointerEvents' in $$props) $$invalidate(3, pointerEvents = $$props.pointerEvents);
    		if ('position' in $$props) $$invalidate(4, position = $$props.position);
    		if ('percentRange' in $$props) $$invalidate(15, percentRange = $$props.percentRange);
    		if ('width' in $$props) $$invalidate(16, width = $$props.width);
    		if ('height' in $$props) $$invalidate(17, height = $$props.height);
    		if ('containerWidth' in $$props) $$invalidate(0, containerWidth = $$props.containerWidth);
    		if ('containerHeight' in $$props) $$invalidate(1, containerHeight = $$props.containerHeight);
    		if ('x' in $$props) $$invalidate(18, x = $$props.x);
    		if ('y' in $$props) $$invalidate(19, y = $$props.y);
    		if ('z' in $$props) $$invalidate(20, z = $$props.z);
    		if ('r' in $$props) $$invalidate(21, r = $$props.r);
    		if ('custom' in $$props) $$invalidate(22, custom = $$props.custom);
    		if ('data' in $$props) $$invalidate(23, data = $$props.data);
    		if ('xDomain' in $$props) $$invalidate(24, xDomain = $$props.xDomain);
    		if ('yDomain' in $$props) $$invalidate(25, yDomain = $$props.yDomain);
    		if ('zDomain' in $$props) $$invalidate(26, zDomain = $$props.zDomain);
    		if ('rDomain' in $$props) $$invalidate(27, rDomain = $$props.rDomain);
    		if ('xNice' in $$props) $$invalidate(28, xNice = $$props.xNice);
    		if ('yNice' in $$props) $$invalidate(29, yNice = $$props.yNice);
    		if ('zNice' in $$props) $$invalidate(30, zNice = $$props.zNice);
    		if ('rNice' in $$props) $$invalidate(31, rNice = $$props.rNice);
    		if ('xReverse' in $$props) $$invalidate(32, xReverse = $$props.xReverse);
    		if ('yReverse' in $$props) $$invalidate(33, yReverse = $$props.yReverse);
    		if ('zReverse' in $$props) $$invalidate(34, zReverse = $$props.zReverse);
    		if ('rReverse' in $$props) $$invalidate(35, rReverse = $$props.rReverse);
    		if ('xPadding' in $$props) $$invalidate(36, xPadding = $$props.xPadding);
    		if ('yPadding' in $$props) $$invalidate(37, yPadding = $$props.yPadding);
    		if ('zPadding' in $$props) $$invalidate(38, zPadding = $$props.zPadding);
    		if ('rPadding' in $$props) $$invalidate(39, rPadding = $$props.rPadding);
    		if ('xScale' in $$props) $$invalidate(40, xScale = $$props.xScale);
    		if ('yScale' in $$props) $$invalidate(41, yScale = $$props.yScale);
    		if ('zScale' in $$props) $$invalidate(42, zScale = $$props.zScale);
    		if ('rScale' in $$props) $$invalidate(43, rScale = $$props.rScale);
    		if ('xRange' in $$props) $$invalidate(44, xRange = $$props.xRange);
    		if ('yRange' in $$props) $$invalidate(45, yRange = $$props.yRange);
    		if ('zRange' in $$props) $$invalidate(46, zRange = $$props.zRange);
    		if ('rRange' in $$props) $$invalidate(47, rRange = $$props.rRange);
    		if ('padding' in $$props) $$invalidate(48, padding = $$props.padding);
    		if ('extents' in $$props) $$invalidate(49, extents = $$props.extents);
    		if ('flatData' in $$props) $$invalidate(50, flatData = $$props.flatData);
    		if ('$$scope' in $$props) $$invalidate(52, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		setContext,
    		writable,
    		derived,
    		makeAccessor,
    		filterObject,
    		calcExtents,
    		calcDomain,
    		createScale,
    		createGetter,
    		getRange,
    		defaultScales,
    		defaultReverses,
    		ssr,
    		pointerEvents,
    		position,
    		percentRange,
    		width,
    		height,
    		containerWidth,
    		containerHeight,
    		x,
    		y,
    		z,
    		r,
    		custom,
    		data,
    		xDomain,
    		yDomain,
    		zDomain,
    		rDomain,
    		xNice,
    		yNice,
    		zNice,
    		rNice,
    		xReverse,
    		yReverse,
    		zReverse,
    		rReverse,
    		xPadding,
    		yPadding,
    		zPadding,
    		rPadding,
    		xScale,
    		yScale,
    		zScale,
    		rScale,
    		xRange,
    		yRange,
    		zRange,
    		rRange,
    		padding,
    		extents,
    		flatData,
    		config,
    		_percentRange,
    		_containerWidth,
    		_containerHeight,
    		_x,
    		_y,
    		_z,
    		_r,
    		_custom,
    		_data,
    		_xDomain,
    		_yDomain,
    		_zDomain,
    		_rDomain,
    		_xNice,
    		_yNice,
    		_zNice,
    		_rNice,
    		_xReverse,
    		_yReverse,
    		_zReverse,
    		_rReverse,
    		_xPadding,
    		_yPadding,
    		_zPadding,
    		_rPadding,
    		_xScale,
    		_yScale,
    		_zScale,
    		_rScale,
    		_xRange,
    		_yRange,
    		_zRange,
    		_rRange,
    		_padding,
    		_flatData,
    		_extents,
    		_config,
    		activeGetters_d,
    		padding_d,
    		box_d,
    		width_d,
    		height_d,
    		extents_d,
    		xDomain_d,
    		yDomain_d,
    		zDomain_d,
    		rDomain_d,
    		xScale_d,
    		xGet_d,
    		yScale_d,
    		yGet_d,
    		zScale_d,
    		zGet_d,
    		rScale_d,
    		rGet_d,
    		xRange_d,
    		yRange_d,
    		zRange_d,
    		rRange_d,
    		aspectRatio_d,
    		context,
    		$width_d,
    		$height_d,
    		$aspectRatio_d,
    		$_containerWidth,
    		$_containerHeight
    	});

    	$$self.$inject_state = $$props => {
    		if ('ssr' in $$props) $$invalidate(2, ssr = $$props.ssr);
    		if ('pointerEvents' in $$props) $$invalidate(3, pointerEvents = $$props.pointerEvents);
    		if ('position' in $$props) $$invalidate(4, position = $$props.position);
    		if ('percentRange' in $$props) $$invalidate(15, percentRange = $$props.percentRange);
    		if ('width' in $$props) $$invalidate(16, width = $$props.width);
    		if ('height' in $$props) $$invalidate(17, height = $$props.height);
    		if ('containerWidth' in $$props) $$invalidate(0, containerWidth = $$props.containerWidth);
    		if ('containerHeight' in $$props) $$invalidate(1, containerHeight = $$props.containerHeight);
    		if ('x' in $$props) $$invalidate(18, x = $$props.x);
    		if ('y' in $$props) $$invalidate(19, y = $$props.y);
    		if ('z' in $$props) $$invalidate(20, z = $$props.z);
    		if ('r' in $$props) $$invalidate(21, r = $$props.r);
    		if ('custom' in $$props) $$invalidate(22, custom = $$props.custom);
    		if ('data' in $$props) $$invalidate(23, data = $$props.data);
    		if ('xDomain' in $$props) $$invalidate(24, xDomain = $$props.xDomain);
    		if ('yDomain' in $$props) $$invalidate(25, yDomain = $$props.yDomain);
    		if ('zDomain' in $$props) $$invalidate(26, zDomain = $$props.zDomain);
    		if ('rDomain' in $$props) $$invalidate(27, rDomain = $$props.rDomain);
    		if ('xNice' in $$props) $$invalidate(28, xNice = $$props.xNice);
    		if ('yNice' in $$props) $$invalidate(29, yNice = $$props.yNice);
    		if ('zNice' in $$props) $$invalidate(30, zNice = $$props.zNice);
    		if ('rNice' in $$props) $$invalidate(31, rNice = $$props.rNice);
    		if ('xReverse' in $$props) $$invalidate(32, xReverse = $$props.xReverse);
    		if ('yReverse' in $$props) $$invalidate(33, yReverse = $$props.yReverse);
    		if ('zReverse' in $$props) $$invalidate(34, zReverse = $$props.zReverse);
    		if ('rReverse' in $$props) $$invalidate(35, rReverse = $$props.rReverse);
    		if ('xPadding' in $$props) $$invalidate(36, xPadding = $$props.xPadding);
    		if ('yPadding' in $$props) $$invalidate(37, yPadding = $$props.yPadding);
    		if ('zPadding' in $$props) $$invalidate(38, zPadding = $$props.zPadding);
    		if ('rPadding' in $$props) $$invalidate(39, rPadding = $$props.rPadding);
    		if ('xScale' in $$props) $$invalidate(40, xScale = $$props.xScale);
    		if ('yScale' in $$props) $$invalidate(41, yScale = $$props.yScale);
    		if ('zScale' in $$props) $$invalidate(42, zScale = $$props.zScale);
    		if ('rScale' in $$props) $$invalidate(43, rScale = $$props.rScale);
    		if ('xRange' in $$props) $$invalidate(44, xRange = $$props.xRange);
    		if ('yRange' in $$props) $$invalidate(45, yRange = $$props.yRange);
    		if ('zRange' in $$props) $$invalidate(46, zRange = $$props.zRange);
    		if ('rRange' in $$props) $$invalidate(47, rRange = $$props.rRange);
    		if ('padding' in $$props) $$invalidate(48, padding = $$props.padding);
    		if ('extents' in $$props) $$invalidate(49, extents = $$props.extents);
    		if ('flatData' in $$props) $$invalidate(50, flatData = $$props.flatData);
    		if ('context' in $$props) $$invalidate(51, context = $$props.context);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*x*/ 262144) {
    			 if (x) config.x = x;
    		}

    		if ($$self.$$.dirty[0] & /*y*/ 524288) {
    			 if (y) config.y = y;
    		}

    		if ($$self.$$.dirty[0] & /*z*/ 1048576) {
    			 if (z) config.z = z;
    		}

    		if ($$self.$$.dirty[0] & /*r*/ 2097152) {
    			 if (r) config.r = r;
    		}

    		if ($$self.$$.dirty[0] & /*xDomain*/ 16777216) {
    			 if (xDomain) config.xDomain = xDomain;
    		}

    		if ($$self.$$.dirty[0] & /*yDomain*/ 33554432) {
    			 if (yDomain) config.yDomain = yDomain;
    		}

    		if ($$self.$$.dirty[0] & /*zDomain*/ 67108864) {
    			 if (zDomain) config.zDomain = zDomain;
    		}

    		if ($$self.$$.dirty[0] & /*rDomain*/ 134217728) {
    			 if (rDomain) config.rDomain = rDomain;
    		}

    		if ($$self.$$.dirty[1] & /*xRange*/ 8192) {
    			 if (xRange) config.xRange = xRange;
    		}

    		if ($$self.$$.dirty[1] & /*yRange*/ 16384) {
    			 if (yRange) config.yRange = yRange;
    		}

    		if ($$self.$$.dirty[1] & /*zRange*/ 32768) {
    			 if (zRange) config.zRange = zRange;
    		}

    		if ($$self.$$.dirty[1] & /*rRange*/ 65536) {
    			 if (rRange) config.rRange = rRange;
    		}

    		if ($$self.$$.dirty[0] & /*percentRange*/ 32768) {
    			 _percentRange.set(percentRange);
    		}

    		if ($$self.$$.dirty[0] & /*containerWidth*/ 1) {
    			 _containerWidth.set(containerWidth);
    		}

    		if ($$self.$$.dirty[0] & /*containerHeight*/ 2) {
    			 _containerHeight.set(containerHeight);
    		}

    		if ($$self.$$.dirty[0] & /*x*/ 262144) {
    			 _x.set(makeAccessor(x));
    		}

    		if ($$self.$$.dirty[0] & /*y*/ 524288) {
    			 _y.set(makeAccessor(y));
    		}

    		if ($$self.$$.dirty[0] & /*z*/ 1048576) {
    			 _z.set(makeAccessor(z));
    		}

    		if ($$self.$$.dirty[0] & /*r*/ 2097152) {
    			 _r.set(makeAccessor(r));
    		}

    		if ($$self.$$.dirty[0] & /*xDomain*/ 16777216) {
    			 _xDomain.set(xDomain);
    		}

    		if ($$self.$$.dirty[0] & /*yDomain*/ 33554432) {
    			 _yDomain.set(yDomain);
    		}

    		if ($$self.$$.dirty[0] & /*zDomain*/ 67108864) {
    			 _zDomain.set(zDomain);
    		}

    		if ($$self.$$.dirty[0] & /*rDomain*/ 134217728) {
    			 _rDomain.set(rDomain);
    		}

    		if ($$self.$$.dirty[0] & /*custom*/ 4194304) {
    			 _custom.set(custom);
    		}

    		if ($$self.$$.dirty[0] & /*data*/ 8388608) {
    			 _data.set(data);
    		}

    		if ($$self.$$.dirty[0] & /*xNice*/ 268435456) {
    			 _xNice.set(xNice);
    		}

    		if ($$self.$$.dirty[0] & /*yNice*/ 536870912) {
    			 _yNice.set(yNice);
    		}

    		if ($$self.$$.dirty[0] & /*zNice*/ 1073741824) {
    			 _zNice.set(zNice);
    		}

    		if ($$self.$$.dirty[1] & /*rNice*/ 1) {
    			 _rNice.set(rNice);
    		}

    		if ($$self.$$.dirty[1] & /*xReverse*/ 2) {
    			 _xReverse.set(xReverse);
    		}

    		if ($$self.$$.dirty[1] & /*yReverse*/ 4) {
    			 _yReverse.set(yReverse);
    		}

    		if ($$self.$$.dirty[1] & /*zReverse*/ 8) {
    			 _zReverse.set(zReverse);
    		}

    		if ($$self.$$.dirty[1] & /*rReverse*/ 16) {
    			 _rReverse.set(rReverse);
    		}

    		if ($$self.$$.dirty[1] & /*xPadding*/ 32) {
    			 _xPadding.set(xPadding);
    		}

    		if ($$self.$$.dirty[1] & /*yPadding*/ 64) {
    			 _yPadding.set(yPadding);
    		}

    		if ($$self.$$.dirty[1] & /*zPadding*/ 128) {
    			 _zPadding.set(zPadding);
    		}

    		if ($$self.$$.dirty[1] & /*rPadding*/ 256) {
    			 _rPadding.set(rPadding);
    		}

    		if ($$self.$$.dirty[1] & /*xScale*/ 512) {
    			 _xScale.set(xScale);
    		}

    		if ($$self.$$.dirty[1] & /*yScale*/ 1024) {
    			 _yScale.set(yScale);
    		}

    		if ($$self.$$.dirty[1] & /*zScale*/ 2048) {
    			 _zScale.set(zScale);
    		}

    		if ($$self.$$.dirty[1] & /*rScale*/ 4096) {
    			 _rScale.set(rScale);
    		}

    		if ($$self.$$.dirty[1] & /*xRange*/ 8192) {
    			 _xRange.set(xRange);
    		}

    		if ($$self.$$.dirty[1] & /*yRange*/ 16384) {
    			 _yRange.set(yRange);
    		}

    		if ($$self.$$.dirty[1] & /*zRange*/ 32768) {
    			 _zRange.set(zRange);
    		}

    		if ($$self.$$.dirty[1] & /*rRange*/ 65536) {
    			 _rRange.set(rRange);
    		}

    		if ($$self.$$.dirty[1] & /*padding*/ 131072) {
    			 _padding.set(padding);
    		}

    		if ($$self.$$.dirty[1] & /*extents*/ 262144) {
    			 _extents.set(filterObject(extents));
    		}

    		if ($$self.$$.dirty[0] & /*data*/ 8388608 | $$self.$$.dirty[1] & /*flatData*/ 524288) {
    			 _flatData.set(flatData || data);
    		}

    		if ($$self.$$.dirty[1] & /*context*/ 1048576) {
    			 setContext('LayerCake', context);
    		}
    	};

    	 $$invalidate(51, context = {
    		activeGetters: activeGetters_d,
    		width: width_d,
    		height: height_d,
    		percentRange: _percentRange,
    		aspectRatio: aspectRatio_d,
    		containerWidth: _containerWidth,
    		containerHeight: _containerHeight,
    		x: _x,
    		y: _y,
    		z: _z,
    		r: _r,
    		custom: _custom,
    		data: _data,
    		xNice: _xNice,
    		yNice: _yNice,
    		zNice: _zNice,
    		rNice: _rNice,
    		xReverse: _xReverse,
    		yReverse: _yReverse,
    		zReverse: _zReverse,
    		rReverse: _rReverse,
    		xPadding: _xPadding,
    		yPadding: _yPadding,
    		zPadding: _zPadding,
    		rPadding: _rPadding,
    		padding: padding_d,
    		flatData: _flatData,
    		extents: extents_d,
    		xDomain: xDomain_d,
    		yDomain: yDomain_d,
    		zDomain: zDomain_d,
    		rDomain: rDomain_d,
    		xRange: xRange_d,
    		yRange: yRange_d,
    		zRange: zRange_d,
    		rRange: rRange_d,
    		config: _config,
    		xScale: xScale_d,
    		xGet: xGet_d,
    		yScale: yScale_d,
    		yGet: yGet_d,
    		zScale: zScale_d,
    		zGet: zGet_d,
    		rScale: rScale_d,
    		rGet: rGet_d
    	});

    	return [
    		containerWidth,
    		containerHeight,
    		ssr,
    		pointerEvents,
    		position,
    		$width_d,
    		$height_d,
    		$aspectRatio_d,
    		$_containerWidth,
    		$_containerHeight,
    		_containerWidth,
    		_containerHeight,
    		width_d,
    		height_d,
    		aspectRatio_d,
    		percentRange,
    		width,
    		height,
    		x,
    		y,
    		z,
    		r,
    		custom,
    		data,
    		xDomain,
    		yDomain,
    		zDomain,
    		rDomain,
    		xNice,
    		yNice,
    		zNice,
    		rNice,
    		xReverse,
    		yReverse,
    		zReverse,
    		rReverse,
    		xPadding,
    		yPadding,
    		zPadding,
    		rPadding,
    		xScale,
    		yScale,
    		zScale,
    		rScale,
    		xRange,
    		yRange,
    		zRange,
    		rRange,
    		padding,
    		extents,
    		flatData,
    		context,
    		$$scope,
    		slots,
    		div_elementresize_handler
    	];
    }

    class LayerCake extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$b,
    			create_fragment$b,
    			safe_not_equal,
    			{
    				ssr: 2,
    				pointerEvents: 3,
    				position: 4,
    				percentRange: 15,
    				width: 16,
    				height: 17,
    				containerWidth: 0,
    				containerHeight: 1,
    				x: 18,
    				y: 19,
    				z: 20,
    				r: 21,
    				custom: 22,
    				data: 23,
    				xDomain: 24,
    				yDomain: 25,
    				zDomain: 26,
    				rDomain: 27,
    				xNice: 28,
    				yNice: 29,
    				zNice: 30,
    				rNice: 31,
    				xReverse: 32,
    				yReverse: 33,
    				zReverse: 34,
    				rReverse: 35,
    				xPadding: 36,
    				yPadding: 37,
    				zPadding: 38,
    				rPadding: 39,
    				xScale: 40,
    				yScale: 41,
    				zScale: 42,
    				rScale: 43,
    				xRange: 44,
    				yRange: 45,
    				zRange: 46,
    				rRange: 47,
    				padding: 48,
    				extents: 49,
    				flatData: 50
    			},
    			null,
    			[-1, -1, -1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LayerCake",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get ssr() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ssr(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pointerEvents() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pointerEvents(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get position() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set position(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get percentRange() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set percentRange(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get width() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get containerWidth() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set containerWidth(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get containerHeight() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set containerHeight(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get x() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set x(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get y() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set y(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get z() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set z(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get r() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set r(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get custom() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set custom(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get data() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get xDomain() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set xDomain(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get yDomain() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set yDomain(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get zDomain() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set zDomain(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rDomain() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rDomain(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get xNice() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set xNice(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get yNice() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set yNice(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get zNice() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set zNice(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rNice() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rNice(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get xReverse() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set xReverse(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get yReverse() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set yReverse(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get zReverse() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set zReverse(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rReverse() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rReverse(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get xPadding() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set xPadding(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get yPadding() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set yPadding(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get zPadding() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set zPadding(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rPadding() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rPadding(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get xScale() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set xScale(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get yScale() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set yScale(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get zScale() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set zScale(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rScale() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rScale(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get xRange() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set xRange(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get yRange() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set yRange(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get zRange() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set zRange(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rRange() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rRange(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get padding() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set padding(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get extents() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set extents(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get flatData() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set flatData(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\layercake\src\layouts\Svg.svelte generated by Svelte v3.44.1 */
    const file$c = "node_modules\\layercake\\src\\layouts\\Svg.svelte";
    const get_defs_slot_changes = dirty => ({});
    const get_defs_slot_context = ctx => ({});

    function create_fragment$c(ctx) {
    	let svg;
    	let defs;
    	let g;
    	let g_transform_value;
    	let svg_style_value;
    	let current;
    	const defs_slot_template = /*#slots*/ ctx[12].defs;
    	const defs_slot = create_slot(defs_slot_template, ctx, /*$$scope*/ ctx[11], get_defs_slot_context);
    	const default_slot_template = /*#slots*/ ctx[12].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[11], null);

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			defs = svg_element("defs");
    			if (defs_slot) defs_slot.c();
    			g = svg_element("g");
    			if (default_slot) default_slot.c();
    			add_location(defs, file$c, 22, 1, 598);
    			attr_dev(g, "transform", g_transform_value = "translate(" + /*$padding*/ ctx[5].left + ", " + /*$padding*/ ctx[5].top + ")");
    			add_location(g, file$c, 25, 1, 643);
    			attr_dev(svg, "class", "layercake-layout-svg svelte-u84d8d");
    			attr_dev(svg, "viewBox", /*viewBox*/ ctx[0]);
    			attr_dev(svg, "width", /*$containerWidth*/ ctx[3]);
    			attr_dev(svg, "height", /*$containerHeight*/ ctx[4]);
    			attr_dev(svg, "style", svg_style_value = "" + (/*zIndexStyle*/ ctx[1] + /*pointerEventsStyle*/ ctx[2]));
    			add_location(svg, file$c, 15, 0, 454);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, defs);

    			if (defs_slot) {
    				defs_slot.m(defs, null);
    			}

    			append_dev(svg, g);

    			if (default_slot) {
    				default_slot.m(g, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (defs_slot) {
    				if (defs_slot.p && (!current || dirty & /*$$scope*/ 2048)) {
    					update_slot_base(
    						defs_slot,
    						defs_slot_template,
    						ctx,
    						/*$$scope*/ ctx[11],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[11])
    						: get_slot_changes(defs_slot_template, /*$$scope*/ ctx[11], dirty, get_defs_slot_changes),
    						get_defs_slot_context
    					);
    				}
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 2048)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[11],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[11])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[11], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*$padding*/ 32 && g_transform_value !== (g_transform_value = "translate(" + /*$padding*/ ctx[5].left + ", " + /*$padding*/ ctx[5].top + ")")) {
    				attr_dev(g, "transform", g_transform_value);
    			}

    			if (!current || dirty & /*viewBox*/ 1) {
    				attr_dev(svg, "viewBox", /*viewBox*/ ctx[0]);
    			}

    			if (!current || dirty & /*$containerWidth*/ 8) {
    				attr_dev(svg, "width", /*$containerWidth*/ ctx[3]);
    			}

    			if (!current || dirty & /*$containerHeight*/ 16) {
    				attr_dev(svg, "height", /*$containerHeight*/ ctx[4]);
    			}

    			if (!current || dirty & /*zIndexStyle, pointerEventsStyle*/ 6 && svg_style_value !== (svg_style_value = "" + (/*zIndexStyle*/ ctx[1] + /*pointerEventsStyle*/ ctx[2]))) {
    				attr_dev(svg, "style", svg_style_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(defs_slot, local);
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(defs_slot, local);
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (defs_slot) defs_slot.d(detaching);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let $containerWidth;
    	let $containerHeight;
    	let $padding;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Svg', slots, ['defs','default']);
    	let { viewBox = undefined } = $$props;
    	let { zIndex = undefined } = $$props;
    	let { pointerEvents = undefined } = $$props;
    	let zIndexStyle = '';
    	let pointerEventsStyle = '';
    	const { containerWidth, containerHeight, padding } = getContext('LayerCake');
    	validate_store(containerWidth, 'containerWidth');
    	component_subscribe($$self, containerWidth, value => $$invalidate(3, $containerWidth = value));
    	validate_store(containerHeight, 'containerHeight');
    	component_subscribe($$self, containerHeight, value => $$invalidate(4, $containerHeight = value));
    	validate_store(padding, 'padding');
    	component_subscribe($$self, padding, value => $$invalidate(5, $padding = value));
    	const writable_props = ['viewBox', 'zIndex', 'pointerEvents'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Svg> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('viewBox' in $$props) $$invalidate(0, viewBox = $$props.viewBox);
    		if ('zIndex' in $$props) $$invalidate(9, zIndex = $$props.zIndex);
    		if ('pointerEvents' in $$props) $$invalidate(10, pointerEvents = $$props.pointerEvents);
    		if ('$$scope' in $$props) $$invalidate(11, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		viewBox,
    		zIndex,
    		pointerEvents,
    		zIndexStyle,
    		pointerEventsStyle,
    		containerWidth,
    		containerHeight,
    		padding,
    		$containerWidth,
    		$containerHeight,
    		$padding
    	});

    	$$self.$inject_state = $$props => {
    		if ('viewBox' in $$props) $$invalidate(0, viewBox = $$props.viewBox);
    		if ('zIndex' in $$props) $$invalidate(9, zIndex = $$props.zIndex);
    		if ('pointerEvents' in $$props) $$invalidate(10, pointerEvents = $$props.pointerEvents);
    		if ('zIndexStyle' in $$props) $$invalidate(1, zIndexStyle = $$props.zIndexStyle);
    		if ('pointerEventsStyle' in $$props) $$invalidate(2, pointerEventsStyle = $$props.pointerEventsStyle);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*zIndex*/ 512) {
    			 $$invalidate(1, zIndexStyle = typeof zIndex !== 'undefined'
    			? `z-index:${zIndex};`
    			: '');
    		}

    		if ($$self.$$.dirty & /*pointerEvents*/ 1024) {
    			 $$invalidate(2, pointerEventsStyle = pointerEvents === false ? 'pointer-events:none;' : '');
    		}
    	};

    	return [
    		viewBox,
    		zIndexStyle,
    		pointerEventsStyle,
    		$containerWidth,
    		$containerHeight,
    		$padding,
    		containerWidth,
    		containerHeight,
    		padding,
    		zIndex,
    		pointerEvents,
    		$$scope,
    		slots
    	];
    }

    class Svg extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { viewBox: 0, zIndex: 9, pointerEvents: 10 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Svg",
    			options,
    			id: create_fragment$c.name
    		});
    	}

    	get viewBox() {
    		throw new Error("<Svg>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set viewBox(value) {
    		throw new Error("<Svg>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get zIndex() {
    		throw new Error("<Svg>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set zIndex(value) {
    		throw new Error("<Svg>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pointerEvents() {
    		throw new Error("<Svg>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pointerEvents(value) {
    		throw new Error("<Svg>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function initRange$1(domain, range) {
      switch (arguments.length) {
        case 0: break;
        case 1: this.range(domain); break;
        default: this.range(range).domain(domain); break;
      }
      return this;
    }

    const implicit = Symbol("implicit");

    function ordinal() {
      var index = new InternMap(),
          domain = [],
          range = [],
          unknown = implicit;

      function scale(d) {
        let i = index.get(d);
        if (i === undefined) {
          if (unknown !== implicit) return unknown;
          index.set(d, i = domain.push(d) - 1);
        }
        return range[i % range.length];
      }

      scale.domain = function(_) {
        if (!arguments.length) return domain.slice();
        domain = [], index = new InternMap();
        for (const value of _) {
          if (index.has(value)) continue;
          index.set(value, domain.push(value) - 1);
        }
        return scale;
      };

      scale.range = function(_) {
        return arguments.length ? (range = Array.from(_), scale) : range.slice();
      };

      scale.unknown = function(_) {
        return arguments.length ? (unknown = _, scale) : unknown;
      };

      scale.copy = function() {
        return ordinal(domain, range).unknown(unknown);
      };

      initRange$1.apply(scale, arguments);

      return scale;
    }

    function constants$1(x) {
      return function() {
        return x;
      };
    }

    function number$2(x) {
      return +x;
    }

    var unit$1 = [0, 1];

    function identity$4(x) {
      return x;
    }

    function normalize$1(a, b) {
      return (b -= (a = +a))
          ? function(x) { return (x - a) / b; }
          : constants$1(isNaN(b) ? NaN : 0.5);
    }

    function clamper$1(a, b) {
      var t;
      if (a > b) t = a, a = b, b = t;
      return function(x) { return Math.max(a, Math.min(b, x)); };
    }

    // normalize(a, b)(x) takes a domain value x in [a,b] and returns the corresponding parameter t in [0,1].
    // interpolate(a, b)(t) takes a parameter t in [0,1] and returns the corresponding range value x in [a,b].
    function bimap$1(domain, range, interpolate) {
      var d0 = domain[0], d1 = domain[1], r0 = range[0], r1 = range[1];
      if (d1 < d0) d0 = normalize$1(d1, d0), r0 = interpolate(r1, r0);
      else d0 = normalize$1(d0, d1), r0 = interpolate(r0, r1);
      return function(x) { return r0(d0(x)); };
    }

    function polymap$1(domain, range, interpolate) {
      var j = Math.min(domain.length, range.length) - 1,
          d = new Array(j),
          r = new Array(j),
          i = -1;

      // Reverse descending domains.
      if (domain[j] < domain[0]) {
        domain = domain.slice().reverse();
        range = range.slice().reverse();
      }

      while (++i < j) {
        d[i] = normalize$1(domain[i], domain[i + 1]);
        r[i] = interpolate(range[i], range[i + 1]);
      }

      return function(x) {
        var i = bisectRight(domain, x, 1, j) - 1;
        return r[i](d[i](x));
      };
    }

    function copy$1(source, target) {
      return target
          .domain(source.domain())
          .range(source.range())
          .interpolate(source.interpolate())
          .clamp(source.clamp())
          .unknown(source.unknown());
    }

    function transformer$1() {
      var domain = unit$1,
          range = unit$1,
          interpolate$1 = interpolate,
          transform,
          untransform,
          unknown,
          clamp = identity$4,
          piecewise,
          output,
          input;

      function rescale() {
        var n = Math.min(domain.length, range.length);
        if (clamp !== identity$4) clamp = clamper$1(domain[0], domain[n - 1]);
        piecewise = n > 2 ? polymap$1 : bimap$1;
        output = input = null;
        return scale;
      }

      function scale(x) {
        return x == null || isNaN(x = +x) ? unknown : (output || (output = piecewise(domain.map(transform), range, interpolate$1)))(transform(clamp(x)));
      }

      scale.invert = function(y) {
        return clamp(untransform((input || (input = piecewise(range, domain.map(transform), interpolateNumber)))(y)));
      };

      scale.domain = function(_) {
        return arguments.length ? (domain = Array.from(_, number$2), rescale()) : domain.slice();
      };

      scale.range = function(_) {
        return arguments.length ? (range = Array.from(_), rescale()) : range.slice();
      };

      scale.rangeRound = function(_) {
        return range = Array.from(_), interpolate$1 = interpolateRound, rescale();
      };

      scale.clamp = function(_) {
        return arguments.length ? (clamp = _ ? true : identity$4, rescale()) : clamp !== identity$4;
      };

      scale.interpolate = function(_) {
        return arguments.length ? (interpolate$1 = _, rescale()) : interpolate$1;
      };

      scale.unknown = function(_) {
        return arguments.length ? (unknown = _, scale) : unknown;
      };

      return function(t, u) {
        transform = t, untransform = u;
        return rescale();
      };
    }

    function continuous$1() {
      return transformer$1()(identity$4, identity$4);
    }

    function tickFormat$1(start, stop, count, specifier) {
      var step = tickStep(start, stop, count),
          precision;
      specifier = formatSpecifier(specifier == null ? ",f" : specifier);
      switch (specifier.type) {
        case "s": {
          var value = Math.max(Math.abs(start), Math.abs(stop));
          if (specifier.precision == null && !isNaN(precision = precisionPrefix(step, value))) specifier.precision = precision;
          return formatPrefix(specifier, value);
        }
        case "":
        case "e":
        case "g":
        case "p":
        case "r": {
          if (specifier.precision == null && !isNaN(precision = precisionRound(step, Math.max(Math.abs(start), Math.abs(stop))))) specifier.precision = precision - (specifier.type === "e");
          break;
        }
        case "f":
        case "%": {
          if (specifier.precision == null && !isNaN(precision = precisionFixed(step))) specifier.precision = precision - (specifier.type === "%") * 2;
          break;
        }
      }
      return format(specifier);
    }

    function linearish$1(scale) {
      var domain = scale.domain;

      scale.ticks = function(count) {
        var d = domain();
        return ticks(d[0], d[d.length - 1], count == null ? 10 : count);
      };

      scale.tickFormat = function(count, specifier) {
        var d = domain();
        return tickFormat$1(d[0], d[d.length - 1], count == null ? 10 : count, specifier);
      };

      scale.nice = function(count) {
        if (count == null) count = 10;

        var d = domain();
        var i0 = 0;
        var i1 = d.length - 1;
        var start = d[i0];
        var stop = d[i1];
        var prestep;
        var step;
        var maxIter = 10;

        if (stop < start) {
          step = start, start = stop, stop = step;
          step = i0, i0 = i1, i1 = step;
        }
        
        while (maxIter-- > 0) {
          step = tickIncrement(start, stop, count);
          if (step === prestep) {
            d[i0] = start;
            d[i1] = stop;
            return domain(d);
          } else if (step > 0) {
            start = Math.floor(start / step) * step;
            stop = Math.ceil(stop / step) * step;
          } else if (step < 0) {
            start = Math.ceil(start * step) / step;
            stop = Math.floor(stop * step) / step;
          } else {
            break;
          }
          prestep = step;
        }

        return scale;
      };

      return scale;
    }

    function linear$2() {
      var scale = continuous$1();

      scale.copy = function() {
        return copy$1(scale, linear$2());
      };

      initRange$1.apply(scale, arguments);

      return linearish$1(scale);
    }

    function transformSymlog(c) {
      return function(x) {
        return Math.sign(x) * Math.log1p(Math.abs(x / c));
      };
    }

    function transformSymexp(c) {
      return function(x) {
        return Math.sign(x) * Math.expm1(Math.abs(x)) * c;
      };
    }

    function symlogish(transform) {
      var c = 1, scale = transform(transformSymlog(c), transformSymexp(c));

      scale.constant = function(_) {
        return arguments.length ? transform(transformSymlog(c = +_), transformSymexp(c)) : c;
      };

      return linearish$1(scale);
    }

    function symlog$1() {
      var scale = symlogish(transformer$1());

      scale.copy = function() {
        return copy$1(scale, symlog$1()).constant(scale.constant());
      };

      return initRange$1.apply(scale, arguments);
    }

    function cubicInOut(t) {
        return t < 0.5 ? 4.0 * t * t * t : 0.5 * Math.pow(2.0 * t - 2.0, 3.0) + 1.0;
    }

    function is_date(obj) {
        return Object.prototype.toString.call(obj) === '[object Date]';
    }

    function get_interpolator(a, b) {
        if (a === b || a !== a)
            return () => a;
        const type = typeof a;
        if (type !== typeof b || Array.isArray(a) !== Array.isArray(b)) {
            throw new Error('Cannot interpolate values of different type');
        }
        if (Array.isArray(a)) {
            const arr = b.map((bi, i) => {
                return get_interpolator(a[i], bi);
            });
            return t => arr.map(fn => fn(t));
        }
        if (type === 'object') {
            if (!a || !b)
                throw new Error('Object cannot be null');
            if (is_date(a) && is_date(b)) {
                a = a.getTime();
                b = b.getTime();
                const delta = b - a;
                return t => new Date(a + t * delta);
            }
            const keys = Object.keys(b);
            const interpolators = {};
            keys.forEach(key => {
                interpolators[key] = get_interpolator(a[key], b[key]);
            });
            return t => {
                const result = {};
                keys.forEach(key => {
                    result[key] = interpolators[key](t);
                });
                return result;
            };
        }
        if (type === 'number') {
            const delta = b - a;
            return t => a + t * delta;
        }
        throw new Error(`Cannot interpolate ${type} values`);
    }
    function tweened(value, defaults = {}) {
        const store = writable(value);
        let task;
        let target_value = value;
        function set(new_value, opts) {
            if (value == null) {
                store.set(value = new_value);
                return Promise.resolve();
            }
            target_value = new_value;
            let previous_task = task;
            let started = false;
            let { delay = 0, duration = 400, easing = identity, interpolate = get_interpolator } = assign(assign({}, defaults), opts);
            if (duration === 0) {
                if (previous_task) {
                    previous_task.abort();
                    previous_task = null;
                }
                store.set(value = target_value);
                return Promise.resolve();
            }
            const start = now() + delay;
            let fn;
            task = loop(now => {
                if (now < start)
                    return true;
                if (!started) {
                    fn = interpolate(value, new_value);
                    if (typeof duration === 'function')
                        duration = duration(value, new_value);
                    started = true;
                }
                if (previous_task) {
                    previous_task.abort();
                    previous_task = null;
                }
                const elapsed = now - start;
                if (elapsed > duration) {
                    store.set(value = new_value);
                    return false;
                }
                // @ts-ignore
                store.set(value = fn(easing(elapsed / duration)));
                return true;
            });
            return task.promise;
        }
        return {
            set,
            update: (fn, opts) => set(fn(target_value, value), opts),
            subscribe: store.subscribe
        };
    }

    function groupData(data, domain, key) {
      let groups = [];
      if (key) {
        domain.forEach(group => {
          groups.push(data.filter(d => d[key] == group));
        });
      } else {
        groups = [data];
      }
      return groups;
    }

    function stackData(data, domain, valKey, grpKey) {
      let groups = [];
      let base = JSON.parse(JSON.stringify(data.filter(d => d[grpKey] == domain[0])));
      base.forEach(d => d[valKey] = 0);
      domain.forEach(group => {
        let clone = JSON.parse(JSON.stringify(data.filter(d => d[grpKey] == group)));
        clone.forEach((d, i) => {
          d[valKey] += base[i][valKey];
          base[i][valKey] = d[valKey];
        });
        groups.push(clone);
      });
      return groups;
    }

    const seed = 1;
    const randomness1 = 5;
    const randomness2 = 2;

    class AccurateBeeswarm {
      constructor(items, radiusFun, xFun, padding, yOffset) {
        this.items = items;
        this.radiusFun = radiusFun;
        this.xFun = xFun;
        this.padding = padding;
        this.yOffset = yOffset;
        this.tieBreakFn = this._sfc32(0x9E3779B9, 0x243F6A88, 0xB7E15162, seed);
        this.maxR = Math.max(...items.map(d => radiusFun(d)));
        this.rng = this._sfc32(1, 2, 3, seed);
      }

      calculateYPositions() {
        let all = this.items
          .map((d, i) => ({
            datum: d,
            originalIndex: i,
            x: this.xFun(d),
            r: this.radiusFun(d) + this.padding,
            y: null,
            placed: false
          }))
          .sort((a, b) => a.x - b.x);
        all.forEach(function(d, i) {
          d.index = i;
        });
        let tieBreakFn = this.tieBreakFn;
        all.forEach(function(d) {
          d.tieBreaker = tieBreakFn(d.x);
        });
        let allSortedByPriority = [...all].sort((a, b) => {
          let key_a = this.radiusFun(a.datum) + a.tieBreaker * randomness1;
          let key_b = this.radiusFun(b.datum) + b.tieBreaker * randomness1;
          if (key_a != key_b) return key_b - key_a;
          return a.x - b.x;
        });
        for (let item of allSortedByPriority) {
          item.placed = true;
          item.y = this._getBestYPosition(item, all);
        }
        all.sort((a, b) => a.originalIndex - b.originalIndex);
        return all.map(d => ({
          x: d.x,
          y: d.y + this.yOffset,
          r: this.radiusFun(d.datum)
        }));
      }

      // Random number generator (for reproducibility)
      // https://stackoverflow.com/a/47593316
      _sfc32(a, b, c, d) {
        let rng = function() {
          a >>>= 0;
          b >>>= 0;
          c >>>= 0;
          d >>>= 0;
          var t = (a + b) | 0;
          a = b ^ (b >>> 9);
          b = (c + (c << 3)) | 0;
          c = (c << 21) | (c >>> 11);
          d = (d + 1) | 0;
          t = (t + d) | 0;
          c = (c + t) | 0;
          return (t >>> 0) / 4294967296;
        };
        for (let i = 0; i < 10; i++) {
          rng();
        }
        return rng;
      }

      _getBestYPosition(item, all) {
        let forbiddenIntervals = [];
        for (let step of [-1, 1]) {
          let xDist;
          let r = item.r;
          for (
            let i = item.index + step;
            i >= 0 &&
            i < all.length &&
            (xDist = Math.abs(item.x - all[i].x)) < r + this.maxR;
            i += step
          ) {
            let other = all[i];
            if (!other.placed) continue;
            let sumOfRadii = r + other.r;
            if (xDist >= r + other.r) continue;
            let yDist = Math.sqrt(sumOfRadii * sumOfRadii - xDist * xDist);
            let forbiddenInterval = [other.y - yDist, other.y + yDist];
            forbiddenIntervals.push(forbiddenInterval);
          }
        }
        if (forbiddenIntervals.length == 0) {
          return item.r * (this.rng() - .5) * randomness2;
        }
        let candidatePositions = forbiddenIntervals.flat();
        candidatePositions.push(0);
        candidatePositions.sort((a, b) => {
          let abs_a = Math.abs(a);
          let abs_b = Math.abs(b);
          if (abs_a < abs_b) return -1;
          if (abs_a > abs_b) return 1;
          return a - b;
        });
        // find first candidate position that is not in any of the
        // forbidden intervals
        for (let i = 0; i < candidatePositions.length; i++) {
          let position = candidatePositions[i];
          if (
            forbiddenIntervals.every(
              interval => position <= interval[0] || position >= interval[1]
            )
          ) {
            return position;
          }
        }
      }
    }

    /* libs\@onsvisual\svelte-charts\src\charts\shared\SetCoords.svelte generated by Svelte v3.44.1 */

    const { console: console_1$1 } = globals;

    function create_fragment$d(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let $yScale;
    	let $xScale;
    	let $yRange;
    	let $xGet;
    	let $rRange;
    	let $rGet;
    	let $yGet;
    	let $width;
    	let $r;
    	let $y;
    	let $x;
    	let $custom;
    	let $data;
    	let $coords;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SetCoords', slots, []);
    	const { data, x, y, r, xGet, yGet, rGet, xScale, yScale, yRange, rRange, custom, width } = getContext('LayerCake');
    	validate_store(data, 'data');
    	component_subscribe($$self, data, value => $$invalidate(20, $data = value));
    	validate_store(x, 'x');
    	component_subscribe($$self, x, value => $$invalidate(18, $x = value));
    	validate_store(y, 'y');
    	component_subscribe($$self, y, value => $$invalidate(17, $y = value));
    	validate_store(r, 'r');
    	component_subscribe($$self, r, value => $$invalidate(16, $r = value));
    	validate_store(xGet, 'xGet');
    	component_subscribe($$self, xGet, value => $$invalidate(26, $xGet = value));
    	validate_store(yGet, 'yGet');
    	component_subscribe($$self, yGet, value => $$invalidate(29, $yGet = value));
    	validate_store(rGet, 'rGet');
    	component_subscribe($$self, rGet, value => $$invalidate(28, $rGet = value));
    	validate_store(xScale, 'xScale');
    	component_subscribe($$self, xScale, value => $$invalidate(24, $xScale = value));
    	validate_store(yScale, 'yScale');
    	component_subscribe($$self, yScale, value => $$invalidate(23, $yScale = value));
    	validate_store(yRange, 'yRange');
    	component_subscribe($$self, yRange, value => $$invalidate(25, $yRange = value));
    	validate_store(rRange, 'rRange');
    	component_subscribe($$self, rRange, value => $$invalidate(27, $rRange = value));
    	validate_store(custom, 'custom');
    	component_subscribe($$self, custom, value => $$invalidate(19, $custom = value));
    	validate_store(width, 'width');
    	component_subscribe($$self, width, value => $$invalidate(15, $width = value));
    	let coords = $custom.coords;
    	validate_store(coords, 'coords');
    	component_subscribe($$self, coords, value => $$invalidate(21, $coords = value));
    	let type = $custom.type;
    	let prevWidth = $width;
    	let coord_needs_update = false;
    	console.log(`coords`);

    	if (!$coords) {
    		setCoords($custom.customData, $custom, $x, $y, $r, $width);
    	}

    	// $: {
    	//   if (coord_needs_update) {
    	//     console.log('UPDATE setCoords()');
    	//     setCoords($custom.customData, $custom, $x, $y, $r, $width);
    	//   }
    	// }
    	function setCoords(data, custom, x, y, r, width) {
    		let mode = custom.mode;
    		let padding = custom.padding;

    		let duration = custom.animation && width == prevWidth
    		? custom.duration
    		: 0;

    		prevWidth = width;
    		let newcoords;

    		if (type == 'bar') {
    			newcoords = data.map((d, i) => d.map((e, j) => {
    				return {
    					x: mode == 'default' || mode == 'grouped' || (mode == 'comparison' || mode == 'stacked') && i == 0
    					? 0
    					: mode == 'stacked' ? x(data[i - 1][j]) : x(e),
    					y: mode == 'grouped'
    					? $yGet(e) + i * (1 / data.length) * $yScale.bandwidth()
    					: $yGet(e),
    					w: mode == 'default' || mode == 'grouped' || (mode == 'comparison' || mode == 'stacked') && i == 0
    					? x(e)
    					: mode == 'stacked' ? x(e) - x(data[i - 1][j]) : 0,
    					h: mode == 'grouped'
    					? $yScale.bandwidth() / data.length
    					: $yScale.bandwidth()
    				};
    			}));
    		} else if (type == 'column') {
    			newcoords = data.map((d, i) => d.map((e, j) => {
    				return {
    					x: mode == 'grouped' && $xScale.bandwidth
    					? $xGet(e) + i * (1 / data.length) * $xScale.bandwidth()
    					: mode == 'grouped'
    						? $xGet(e)[0] + i * (1 / data.length) * Math.max(0, $xGet(e)[1] - $xGet(e)[0])
    						: $xScale.bandwidth ? $xGet(e) : $xGet(e)[0],
    					y: y(e),
    					w: mode == 'grouped' && $xScale.bandwidth
    					? $xScale.bandwidth() / data.length
    					: mode == 'grouped'
    						? Math.max(0, $xGet(e)[1] - $xGet(e)[0]) / data.length
    						: $xScale.bandwidth
    							? $xScale.bandwidth()
    							: Math.max(0, $xGet(e)[1] - $xGet(e)[0]),
    					h: mode == 'default' || mode == 'grouped' || (mode == 'comparison' || mode == 'stacked') && i == 0
    					? y(e)
    					: mode == 'stacked' ? y(e) - y(data[i - 1][j]) : 0
    				};
    			}));
    		} else if (type == 'scatter') {
    			let rVal = d => r ? $rGet(d) : $rRange[0];

    			newcoords = y
    			? data.map(d => ({ x: x(d), y: y(d), r: rVal(d) }))
    			: new AccurateBeeswarm(data, d => rVal(d), d => $xGet(d), padding, $yRange[0] / 2).calculateYPositions().map(d => ({
    					x: $xScale.invert(d.x),
    					y: $yScale.invert(d.y),
    					r: d.r
    				}));
    		} else if (type == 'line') {
    			newcoords = data.map(d => d.map(e => {
    				return { x: x(e), y: y(e) };
    			}));
    		}

    		coords.set(newcoords, { duration });
    		console.log(`SetCoord.svelte: new coords`);
    		console.log(newcoords);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<SetCoords> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		getContext,
    		AccurateBeeswarm,
    		data,
    		x,
    		y,
    		r,
    		xGet,
    		yGet,
    		rGet,
    		xScale,
    		yScale,
    		yRange,
    		rRange,
    		custom,
    		width,
    		coords,
    		type,
    		prevWidth,
    		coord_needs_update,
    		setCoords,
    		$yScale,
    		$xScale,
    		$yRange,
    		$xGet,
    		$rRange,
    		$rGet,
    		$yGet,
    		$width,
    		$r,
    		$y,
    		$x,
    		$custom,
    		$data,
    		$coords
    	});

    	$$self.$inject_state = $$props => {
    		if ('coords' in $$props) $$invalidate(13, coords = $$props.coords);
    		if ('type' in $$props) type = $$props.type;
    		if ('prevWidth' in $$props) prevWidth = $$props.prevWidth;
    		if ('coord_needs_update' in $$props) $$invalidate(14, coord_needs_update = $$props.coord_needs_update);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*$custom, $coords, coord_needs_update*/ 2637824) {
    			 {
    				console.log(' *********************** SetCoords ***********************');
    				console.log(`$custom.groups_selected`);
    				console.log($custom.groups_selected);
    				console.log(`$coords`);
    				console.log($coords);

    				$$invalidate(14, coord_needs_update = $coords.length
    				? $coords.length != $custom.groups_selected.length
    				: false);

    				console.log(`coord_needs_update: ${coord_needs_update}`);
    			}
    		}

    		if ($$self.$$.dirty[0] & /*coord_needs_update, $data, $custom, $x, $y, $r, $width*/ 2080768) {
    			 {
    				if (!coord_needs_update) {
    					setCoords($data, $custom, $x, $y, $r, $width);
    				}
    			}
    		}
    	};

    	return [
    		data,
    		x,
    		y,
    		r,
    		xGet,
    		yGet,
    		rGet,
    		xScale,
    		yScale,
    		yRange,
    		rRange,
    		custom,
    		width,
    		coords,
    		coord_needs_update,
    		$width,
    		$r,
    		$y,
    		$x,
    		$custom,
    		$data,
    		$coords
    	];
    }

    class SetCoords extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {}, null, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SetCoords",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }

    /* libs\@onsvisual\svelte-charts\src\charts\shared\Line.svelte generated by Svelte v3.44.1 */

    const { console: console_1$2 } = globals;
    const file$d = "libs\\@onsvisual\\svelte-charts\\src\\charts\\shared\\Line.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[56] = list[i];
    	child_ctx[58] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[56] = list[i];
    	child_ctx[58] = i;
    	return child_ctx;
    }

    // (144:0) {#if coords_subset}
    function create_if_block$5(ctx) {
    	let g;
    	let each_1_anchor;
    	let current;
    	let each_value_1 = /*coords_subset*/ ctx[7];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let if_block = /*idKey*/ ctx[21] && (/*hover*/ ctx[3] || /*selected*/ ctx[1] || /*highlighted*/ ctx[4][0]) && create_if_block_1$2(ctx);

    	const block = {
    		c: function create() {
    			g = svg_element("g");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    			if (if_block) if_block.c();
    			attr_dev(g, "class", "line-group");
    			add_location(g, file$d, 144, 2, 3661);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(g, null);
    			}

    			append_dev(g, each_1_anchor);
    			if (if_block) if_block.m(g, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*makePath, coords_subset, $config, $zGet, $data, lineWidth, doHover, doSelect*/ 234881988) {
    				each_value_1 = /*coords_subset*/ ctx[7];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(g, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (/*idKey*/ ctx[21] && (/*hover*/ ctx[3] || /*selected*/ ctx[1] || /*highlighted*/ ctx[4][0])) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$2(ctx);
    					if_block.c();
    					if_block.m(g, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    			destroy_each(each_blocks, detaching);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(144:0) {#if coords_subset}",
    		ctx
    	});

    	return block;
    }

    // (146:4) {#each coords_subset as group, i}
    function create_each_block_1(ctx) {
    	let path0;
    	let path0_d_value;
    	let path1;
    	let path1_d_value;
    	let path1_stroke_value;
    	let path1_transition;
    	let current;
    	let mounted;
    	let dispose;

    	function mouseover_handler(...args) {
    		return /*mouseover_handler*/ ctx[35](/*i*/ ctx[58], ...args);
    	}

    	function focus_handler(...args) {
    		return /*focus_handler*/ ctx[37](/*i*/ ctx[58], ...args);
    	}

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[39](/*i*/ ctx[58], ...args);
    	}

    	const block = {
    		c: function create() {
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			attr_dev(path0, "class", "path-hover svelte-1gezi8j");
    			attr_dev(path0, "d", path0_d_value = /*makePath*/ ctx[25](/*group*/ ctx[56]));
    			add_location(path0, file$d, 146, 6, 3730);
    			attr_dev(path1, "class", "path-line svelte-1gezi8j");
    			attr_dev(path1, "d", path1_d_value = /*makePath*/ ctx[25](/*group*/ ctx[56]));

    			attr_dev(path1, "stroke", path1_stroke_value = /*$config*/ ctx[8].z
    			? /*$zGet*/ ctx[9](/*$data*/ ctx[6][/*i*/ ctx[58]][0])
    			: /*$config*/ ctx[8].zRange[0]);

    			attr_dev(path1, "stroke-width", /*lineWidth*/ ctx[2]);
    			add_location(path1, file$d, 155, 6, 4051);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path0, anchor);
    			insert_dev(target, path1, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(path0, "mouseover", mouseover_handler, false, false, false),
    					listen_dev(path0, "mouseleave", /*mouseleave_handler*/ ctx[36], false, false, false),
    					listen_dev(path0, "focus", focus_handler, false, false, false),
    					listen_dev(path0, "blur", /*blur_handler*/ ctx[38], false, false, false),
    					listen_dev(path0, "click", click_handler, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (!current || dirty[0] & /*coords_subset*/ 128 && path0_d_value !== (path0_d_value = /*makePath*/ ctx[25](/*group*/ ctx[56]))) {
    				attr_dev(path0, "d", path0_d_value);
    			}

    			if (!current || dirty[0] & /*coords_subset*/ 128 && path1_d_value !== (path1_d_value = /*makePath*/ ctx[25](/*group*/ ctx[56]))) {
    				attr_dev(path1, "d", path1_d_value);
    			}

    			if (!current || dirty[0] & /*$config, $zGet, $data*/ 832 && path1_stroke_value !== (path1_stroke_value = /*$config*/ ctx[8].z
    			? /*$zGet*/ ctx[9](/*$data*/ ctx[6][/*i*/ ctx[58]][0])
    			: /*$config*/ ctx[8].zRange[0])) {
    				attr_dev(path1, "stroke", path1_stroke_value);
    			}

    			if (!current || dirty[0] & /*lineWidth*/ 4) {
    				attr_dev(path1, "stroke-width", /*lineWidth*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!path1_transition) path1_transition = create_bidirectional_transition(path1, fade, { delay: 0, duration: 300 }, true);
    				path1_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!path1_transition) path1_transition = create_bidirectional_transition(path1, fade, { delay: 0, duration: 300 }, false);
    			path1_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path0);
    			if (detaching) detach_dev(path1);
    			if (detaching && path1_transition) path1_transition.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(146:4) {#each coords_subset as group, i}",
    		ctx
    	});

    	return block;
    }

    // (165:4) {#if idKey && (hover || selected || highlighted[0])}
    function create_if_block_1$2(ctx) {
    	let each_1_anchor;
    	let each_value = /*$coords*/ ctx[5];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*makePath, $coords, $data, idKey, hovered, colorHover, selected, colorSelect, colorHighlight, lineWidth, highlighted*/ 65011831) {
    				each_value = /*$coords*/ ctx[5];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(165:4) {#if idKey && (hover || selected || highlighted[0])}",
    		ctx
    	});

    	return block;
    }

    // (167:8) {#if [hovered, selected, ...highlighted].includes($data[i][0][idKey])}
    function create_if_block_2(ctx) {
    	let path;
    	let path_d_value;
    	let path_stroke_value;
    	let path_stroke_width_value;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "class", "path-overlay svelte-1gezi8j");
    			attr_dev(path, "d", path_d_value = /*makePath*/ ctx[25](/*group*/ ctx[56]));

    			attr_dev(path, "stroke", path_stroke_value = /*$data*/ ctx[6][/*i*/ ctx[58]][0][/*idKey*/ ctx[21]] == /*hovered*/ ctx[0]
    			? /*colorHover*/ ctx[22]
    			: /*$data*/ ctx[6][/*i*/ ctx[58]][0][/*idKey*/ ctx[21]] == /*selected*/ ctx[1]
    				? /*colorSelect*/ ctx[23]
    				: /*colorHighlight*/ ctx[24]);

    			attr_dev(path, "stroke-width", path_stroke_width_value = /*lineWidth*/ ctx[2] + 1.5);
    			add_location(path, file$d, 167, 10, 4480);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$coords*/ 32 && path_d_value !== (path_d_value = /*makePath*/ ctx[25](/*group*/ ctx[56]))) {
    				attr_dev(path, "d", path_d_value);
    			}

    			if (dirty[0] & /*$data, hovered, selected*/ 67 && path_stroke_value !== (path_stroke_value = /*$data*/ ctx[6][/*i*/ ctx[58]][0][/*idKey*/ ctx[21]] == /*hovered*/ ctx[0]
    			? /*colorHover*/ ctx[22]
    			: /*$data*/ ctx[6][/*i*/ ctx[58]][0][/*idKey*/ ctx[21]] == /*selected*/ ctx[1]
    				? /*colorSelect*/ ctx[23]
    				: /*colorHighlight*/ ctx[24])) {
    				attr_dev(path, "stroke", path_stroke_value);
    			}

    			if (dirty[0] & /*lineWidth*/ 4 && path_stroke_width_value !== (path_stroke_width_value = /*lineWidth*/ ctx[2] + 1.5)) {
    				attr_dev(path, "stroke-width", path_stroke_width_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(167:8) {#if [hovered, selected, ...highlighted].includes($data[i][0][idKey])}",
    		ctx
    	});

    	return block;
    }

    // (166:6) {#each $coords as group, i}
    function create_each_block(ctx) {
    	let show_if = [/*hovered*/ ctx[0], /*selected*/ ctx[1], .../*highlighted*/ ctx[4]].includes(/*$data*/ ctx[6][/*i*/ ctx[58]][0][/*idKey*/ ctx[21]]);
    	let if_block_anchor;
    	let if_block = show_if && create_if_block_2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*hovered, selected, highlighted, $data*/ 83) show_if = [/*hovered*/ ctx[0], /*selected*/ ctx[1], .../*highlighted*/ ctx[4]].includes(/*$data*/ ctx[6][/*i*/ ctx[58]][0][/*idKey*/ ctx[21]]);

    			if (show_if) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_2(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(166:6) {#each $coords as group, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*coords_subset*/ ctx[7] && create_if_block$5(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*coords_subset*/ ctx[7]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*coords_subset*/ 128) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$5(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function debounce$1(func, wait) {
    	let timeout;

    	return function executedFunction(...args) {
    		const later = () => {
    			clearTimeout(timeout);
    			func(...args);
    		};

    		clearTimeout(timeout);
    		timeout = setTimeout(later, wait);
    	};
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let $yScale;
    	let $xScale;
    	let $coords;
    	let $custom;
    	let $width;
    	let $r;
    	let $y;
    	let $x;
    	let $data;
    	let $config;
    	let $zGet;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Line', slots, []);
    	let { data, xScale, yScale, zGet, config, custom, x, y, r, xGet, yGet, rGet, yRange, rRange, width } = getContext('LayerCake');
    	validate_store(data, 'data');
    	component_subscribe($$self, data, value => $$invalidate(6, $data = value));
    	validate_store(xScale, 'xScale');
    	component_subscribe($$self, xScale, value => $$invalidate(43, $xScale = value));
    	validate_store(yScale, 'yScale');
    	component_subscribe($$self, yScale, value => $$invalidate(42, $yScale = value));
    	validate_store(zGet, 'zGet');
    	component_subscribe($$self, zGet, value => $$invalidate(9, $zGet = value));
    	validate_store(config, 'config');
    	component_subscribe($$self, config, value => $$invalidate(8, $config = value));
    	validate_store(custom, 'custom');
    	component_subscribe($$self, custom, value => $$invalidate(30, $custom = value));
    	validate_store(x, 'x');
    	component_subscribe($$self, x, value => $$invalidate(34, $x = value));
    	validate_store(y, 'y');
    	component_subscribe($$self, y, value => $$invalidate(33, $y = value));
    	validate_store(r, 'r');
    	component_subscribe($$self, r, value => $$invalidate(32, $r = value));
    	validate_store(width, 'width');
    	component_subscribe($$self, width, value => $$invalidate(31, $width = value));
    	const dispatch = createEventDispatcher();
    	let { lineWidth = 2.5 } = $$props;
    	let { hover = false } = $$props;
    	let { hovered = null } = $$props;
    	let { select = false } = $$props;
    	let { selected = null } = $$props;
    	let { highlighted = [] } = $$props;
    	let coords = $custom.coords;
    	validate_store(coords, 'coords');
    	component_subscribe($$self, coords, value => $$invalidate(5, $coords = value));
    	let step = $custom.step;
    	let idKey = $custom.idKey;
    	let colorHover = $custom.colorHover ? $custom.colorHover : 'orange';
    	let colorSelect = $custom.colorSelect ? $custom.colorSelect : '#206095';

    	let colorHighlight = $custom.colorHighlight
    	? $custom.colorHighlight
    	: '#206095';

    	let type = $custom.type;
    	let prevWidth = $width;
    	let groups_all = $custom.groups_all;
    	let groups_selected = $custom.groups_selected;
    	let debounceTimer;
    	let debounceValue = 100;
    	let coords_subset;

    	// } else {
    	//   coords_subset = $coords.slice(0, 3);
    	// }
    	// Function to make SVG path
    	const makePath = group => {
    		let path = 'M' + group.map(d => {
    			return $xScale(d.x) + ',' + $yScale(d.y);
    		}).join('L');

    		return path;
    	};

    	function doHover(e, d) {
    		if (hover) {
    			$$invalidate(0, hovered = d ? d[0][idKey] : null);
    			dispatch('hover', { id: hovered, data: d, event: e });
    		}
    	}

    	function doSelect(e, d) {
    		if (select) {
    			$$invalidate(1, selected = d ? d[0][idKey] : null);
    			dispatch('select', { id: selected, data: d, event: e });
    		}
    	}

    	const debouncedLog = debounce$1(val => console.log(val), 200);

    	function debouncedSetCoords(data, custom, x, y, r, width) {
    		clearTimeout(debounceTimer);

    		debounceTimer = setTimeout(
    			() => {
    				console.log('debouncedSetCoords() fires');
    				let mode = custom.mode;
    				let padding = custom.padding;

    				let duration = custom.animation && width == prevWidth
    				? custom.duration
    				: 0;

    				prevWidth = width;
    				let newcoords;

    				if (type == 'line') {
    					newcoords = data.map(d => d.map(e => {
    						return { x: x(e), y: y(e) };
    					}));
    				}

    				coords.set(newcoords, { duration });
    			},
    			debounceValue
    		); // Debounce time: 200 milliseconds (adjust as needed)
    	}

    	const writable_props = ['lineWidth', 'hover', 'hovered', 'select', 'selected', 'highlighted'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$2.warn(`<Line> was created with unknown prop '${key}'`);
    	});

    	const mouseover_handler = (i, e) => doHover(e, $data[i]);
    	const mouseleave_handler = e => doHover(e, null);
    	const focus_handler = (i, e) => doHover(e, $data[i]);
    	const blur_handler = e => doHover(e, null);
    	const click_handler = (i, e) => doSelect(e, $data[i]);

    	$$self.$$set = $$props => {
    		if ('lineWidth' in $$props) $$invalidate(2, lineWidth = $$props.lineWidth);
    		if ('hover' in $$props) $$invalidate(3, hover = $$props.hover);
    		if ('hovered' in $$props) $$invalidate(0, hovered = $$props.hovered);
    		if ('select' in $$props) $$invalidate(28, select = $$props.select);
    		if ('selected' in $$props) $$invalidate(1, selected = $$props.selected);
    		if ('highlighted' in $$props) $$invalidate(4, highlighted = $$props.highlighted);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		createEventDispatcher,
    		fade,
    		data,
    		xScale,
    		yScale,
    		zGet,
    		config,
    		custom,
    		x,
    		y,
    		r,
    		xGet,
    		yGet,
    		rGet,
    		yRange,
    		rRange,
    		width,
    		dispatch,
    		lineWidth,
    		hover,
    		hovered,
    		select,
    		selected,
    		highlighted,
    		coords,
    		step,
    		idKey,
    		colorHover,
    		colorSelect,
    		colorHighlight,
    		type,
    		prevWidth,
    		groups_all,
    		groups_selected,
    		debounceTimer,
    		debounceValue,
    		coords_subset,
    		makePath,
    		doHover,
    		doSelect,
    		debounce: debounce$1,
    		debouncedLog,
    		debouncedSetCoords,
    		$yScale,
    		$xScale,
    		$coords,
    		$custom,
    		$width,
    		$r,
    		$y,
    		$x,
    		$data,
    		$config,
    		$zGet
    	});

    	$$self.$inject_state = $$props => {
    		if ('data' in $$props) $$invalidate(10, data = $$props.data);
    		if ('xScale' in $$props) $$invalidate(11, xScale = $$props.xScale);
    		if ('yScale' in $$props) $$invalidate(12, yScale = $$props.yScale);
    		if ('zGet' in $$props) $$invalidate(13, zGet = $$props.zGet);
    		if ('config' in $$props) $$invalidate(14, config = $$props.config);
    		if ('custom' in $$props) $$invalidate(15, custom = $$props.custom);
    		if ('x' in $$props) $$invalidate(16, x = $$props.x);
    		if ('y' in $$props) $$invalidate(17, y = $$props.y);
    		if ('r' in $$props) $$invalidate(18, r = $$props.r);
    		if ('xGet' in $$props) xGet = $$props.xGet;
    		if ('yGet' in $$props) yGet = $$props.yGet;
    		if ('rGet' in $$props) rGet = $$props.rGet;
    		if ('yRange' in $$props) yRange = $$props.yRange;
    		if ('rRange' in $$props) rRange = $$props.rRange;
    		if ('width' in $$props) $$invalidate(19, width = $$props.width);
    		if ('lineWidth' in $$props) $$invalidate(2, lineWidth = $$props.lineWidth);
    		if ('hover' in $$props) $$invalidate(3, hover = $$props.hover);
    		if ('hovered' in $$props) $$invalidate(0, hovered = $$props.hovered);
    		if ('select' in $$props) $$invalidate(28, select = $$props.select);
    		if ('selected' in $$props) $$invalidate(1, selected = $$props.selected);
    		if ('highlighted' in $$props) $$invalidate(4, highlighted = $$props.highlighted);
    		if ('coords' in $$props) $$invalidate(20, coords = $$props.coords);
    		if ('step' in $$props) step = $$props.step;
    		if ('idKey' in $$props) $$invalidate(21, idKey = $$props.idKey);
    		if ('colorHover' in $$props) $$invalidate(22, colorHover = $$props.colorHover);
    		if ('colorSelect' in $$props) $$invalidate(23, colorSelect = $$props.colorSelect);
    		if ('colorHighlight' in $$props) $$invalidate(24, colorHighlight = $$props.colorHighlight);
    		if ('type' in $$props) type = $$props.type;
    		if ('prevWidth' in $$props) prevWidth = $$props.prevWidth;
    		if ('groups_all' in $$props) $$invalidate(52, groups_all = $$props.groups_all);
    		if ('groups_selected' in $$props) $$invalidate(29, groups_selected = $$props.groups_selected);
    		if ('debounceTimer' in $$props) debounceTimer = $$props.debounceTimer;
    		if ('debounceValue' in $$props) debounceValue = $$props.debounceValue;
    		if ('coords_subset' in $$props) $$invalidate(7, coords_subset = $$props.coords_subset);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*$data, $custom*/ 1073741888 | $$self.$$.dirty[1] & /*$x, $y, $r, $width*/ 15) {
    			 {
    				debouncedSetCoords($data, $custom, $x, $y, $r, $width);
    			}
    		}

    		if ($$self.$$.dirty[0] & /*$custom, groups_selected, $coords*/ 1610612768) {
    			// Path subset logic here
    			 {
    				$$invalidate(29, groups_selected = $custom.groups_selected);
    				console.log(groups_all);
    				console.log(groups_selected);
    				const index_to_include = groups_all.map((item, index) => groups_selected.includes(item) ? index : -1).filter(index => index !== -1);
    				console.log(index_to_include);

    				if ($coords) {
    					$$invalidate(7, coords_subset = index_to_include.map(index => $coords[index]));
    				} // console.log(`coords_subset_dev`);
    				// console.log(coords_subset_dev);
    			} // if (groups_selected.includes('flowers')) {
    			//   coords_subset = $coords;
    		}
    	};

    	return [
    		hovered,
    		selected,
    		lineWidth,
    		hover,
    		highlighted,
    		$coords,
    		$data,
    		coords_subset,
    		$config,
    		$zGet,
    		data,
    		xScale,
    		yScale,
    		zGet,
    		config,
    		custom,
    		x,
    		y,
    		r,
    		width,
    		coords,
    		idKey,
    		colorHover,
    		colorSelect,
    		colorHighlight,
    		makePath,
    		doHover,
    		doSelect,
    		select,
    		groups_selected,
    		$custom,
    		$width,
    		$r,
    		$y,
    		$x,
    		mouseover_handler,
    		mouseleave_handler,
    		focus_handler,
    		blur_handler,
    		click_handler
    	];
    }

    class Line extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$e,
    			create_fragment$e,
    			safe_not_equal,
    			{
    				lineWidth: 2,
    				hover: 3,
    				hovered: 0,
    				select: 28,
    				selected: 1,
    				highlighted: 4
    			},
    			null,
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Line",
    			options,
    			id: create_fragment$e.name
    		});
    	}

    	get lineWidth() {
    		throw new Error("<Line>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set lineWidth(value) {
    		throw new Error("<Line>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hover() {
    		throw new Error("<Line>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hover(value) {
    		throw new Error("<Line>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hovered() {
    		throw new Error("<Line>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hovered(value) {
    		throw new Error("<Line>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get select() {
    		throw new Error("<Line>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set select(value) {
    		throw new Error("<Line>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selected() {
    		throw new Error("<Line>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selected(value) {
    		throw new Error("<Line>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get highlighted() {
    		throw new Error("<Line>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set highlighted(value) {
    		throw new Error("<Line>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* libs\@onsvisual\svelte-charts\src\charts\shared\Area.svelte generated by Svelte v3.44.1 */
    const file$e = "libs\\@onsvisual\\svelte-charts\\src\\charts\\shared\\Area.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[19] = list[i];
    	child_ctx[21] = i;
    	return child_ctx;
    }

    // (36:0) {#if $coords}
    function create_if_block$6(ctx) {
    	let g;
    	let each_value = /*$coords*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			g = svg_element("g");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(g, "class", "area-group");
    			add_location(g, file$e, 36, 0, 816);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(g, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*makeArea, $coords, $config, $zGet, $data, $zRange, opacity*/ 16447) {
    				each_value = /*$coords*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(g, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(36:0) {#if $coords}",
    		ctx
    	});

    	return block;
    }

    // (38:1) {#each $coords as group, i}
    function create_each_block$1(ctx) {
    	let path;
    	let path_d_value;
    	let path_fill_value;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "class", "path-area");
    			attr_dev(path, "d", path_d_value = /*makeArea*/ ctx[14](/*group*/ ctx[19], /*i*/ ctx[21]));

    			attr_dev(path, "fill", path_fill_value = /*$config*/ ctx[2].z
    			? /*$zGet*/ ctx[3](/*$data*/ ctx[4][/*i*/ ctx[21]][0])
    			: /*$zRange*/ ctx[5][0]);

    			attr_dev(path, "opacity", /*opacity*/ ctx[0]);
    			add_location(path, file$e, 38, 1, 871);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$coords*/ 2 && path_d_value !== (path_d_value = /*makeArea*/ ctx[14](/*group*/ ctx[19], /*i*/ ctx[21]))) {
    				attr_dev(path, "d", path_d_value);
    			}

    			if (dirty & /*$config, $zGet, $data, $zRange*/ 60 && path_fill_value !== (path_fill_value = /*$config*/ ctx[2].z
    			? /*$zGet*/ ctx[3](/*$data*/ ctx[4][/*i*/ ctx[21]][0])
    			: /*$zRange*/ ctx[5][0])) {
    				attr_dev(path, "fill", path_fill_value);
    			}

    			if (dirty & /*opacity*/ 1) {
    				attr_dev(path, "opacity", /*opacity*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(38:1) {#each $coords as group, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let if_block_anchor;
    	let if_block = /*$coords*/ ctx[1] && create_if_block$6(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$coords*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$6(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let $yScale;
    	let $xScale;
    	let $coords;
    	let $custom;
    	let $config;
    	let $zGet;
    	let $data;
    	let $zRange;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Area', slots, []);
    	const { data, xScale, yScale, zGet, zRange, config, custom } = getContext('LayerCake');
    	validate_store(data, 'data');
    	component_subscribe($$self, data, value => $$invalidate(4, $data = value));
    	validate_store(xScale, 'xScale');
    	component_subscribe($$self, xScale, value => $$invalidate(16, $xScale = value));
    	validate_store(yScale, 'yScale');
    	component_subscribe($$self, yScale, value => $$invalidate(15, $yScale = value));
    	validate_store(zGet, 'zGet');
    	component_subscribe($$self, zGet, value => $$invalidate(3, $zGet = value));
    	validate_store(zRange, 'zRange');
    	component_subscribe($$self, zRange, value => $$invalidate(5, $zRange = value));
    	validate_store(config, 'config');
    	component_subscribe($$self, config, value => $$invalidate(2, $config = value));
    	validate_store(custom, 'custom');
    	component_subscribe($$self, custom, value => $$invalidate(17, $custom = value));
    	let { opacity = 1 } = $$props;
    	let coords = $custom.coords;
    	validate_store(coords, 'coords');
    	component_subscribe($$self, coords, value => $$invalidate(1, $coords = value));
    	let idKey = $custom.idKey;

    	// Function to make SVG path
    	const makeArea = (group, i) => {
    		let yRange = $yScale.range();

    		let path1 = 'M' + group.map(d => {
    			return $xScale(d.x) + ',' + $yScale(d.y);
    		}).join('L');

    		let path2 = i == 0
    		? 'L' + group.map(d => {
    				return $xScale(d.x) + ',' + yRange[0];
    			}).reverse().join('L')
    		: 'L' + [...$coords[i - 1]].reverse().map(d => {
    				return $xScale(d.x) + ',' + $yScale(d.y);
    			}).join('L');

    		let area = path1 + path2 + 'Z';
    		return area;
    	};

    	const writable_props = ['opacity'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Area> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('opacity' in $$props) $$invalidate(0, opacity = $$props.opacity);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		data,
    		xScale,
    		yScale,
    		zGet,
    		zRange,
    		config,
    		custom,
    		opacity,
    		coords,
    		idKey,
    		makeArea,
    		$yScale,
    		$xScale,
    		$coords,
    		$custom,
    		$config,
    		$zGet,
    		$data,
    		$zRange
    	});

    	$$self.$inject_state = $$props => {
    		if ('opacity' in $$props) $$invalidate(0, opacity = $$props.opacity);
    		if ('coords' in $$props) $$invalidate(13, coords = $$props.coords);
    		if ('idKey' in $$props) idKey = $$props.idKey;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		opacity,
    		$coords,
    		$config,
    		$zGet,
    		$data,
    		$zRange,
    		data,
    		xScale,
    		yScale,
    		zGet,
    		zRange,
    		config,
    		custom,
    		coords,
    		makeArea
    	];
    }

    class Area extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, { opacity: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Area",
    			options,
    			id: create_fragment$f.name
    		});
    	}

    	get opacity() {
    		throw new Error("<Area>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set opacity(value) {
    		throw new Error("<Area>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* libs\@onsvisual\svelte-charts\src\charts\shared\AxisX.svelte generated by Svelte v3.44.1 */
    const file$f = "libs\\@onsvisual\\svelte-charts\\src\\charts\\shared\\AxisX.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[24] = list[i];
    	child_ctx[26] = i;
    	return child_ctx;
    }

    // (46:3) {#if gridlines !== false}
    function create_if_block_1$3(ctx) {
    	let line;
    	let line_y__value;

    	const block = {
    		c: function create() {
    			line = svg_element("line");
    			attr_dev(line, "class", "gridline svelte-r9f2bw");
    			attr_dev(line, "y1", line_y__value = /*$height*/ ctx[17] * -1);
    			attr_dev(line, "y2", "0");
    			attr_dev(line, "x1", "0");
    			attr_dev(line, "x2", "0");
    			set_style(line, "stroke", /*tickColor*/ ctx[3]);
    			toggle_class(line, "dashed", /*tickDashed*/ ctx[1]);
    			add_location(line, file$f, 46, 4, 1181);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, line, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$height*/ 131072 && line_y__value !== (line_y__value = /*$height*/ ctx[17] * -1)) {
    				attr_dev(line, "y1", line_y__value);
    			}

    			if (dirty & /*tickColor*/ 8) {
    				set_style(line, "stroke", /*tickColor*/ ctx[3]);
    			}

    			if (dirty & /*tickDashed*/ 2) {
    				toggle_class(line, "dashed", /*tickDashed*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(line);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(46:3) {#if gridlines !== false}",
    		ctx
    	});

    	return block;
    }

    // (49:3) {#if tickMarks === true}
    function create_if_block$7(ctx) {
    	let line;
    	let line_y__value;
    	let line_y__value_1;
    	let line_x__value;
    	let line_x__value_1;

    	const block = {
    		c: function create() {
    			line = svg_element("line");
    			attr_dev(line, "class", "tick-mark svelte-r9f2bw");
    			attr_dev(line, "y1", line_y__value = 0);
    			attr_dev(line, "y2", line_y__value_1 = 6);

    			attr_dev(line, "x1", line_x__value = /*xTick*/ ctx[7] || /*isBandwidth*/ ctx[13]
    			? /*$xScale*/ ctx[14].bandwidth() / 2
    			: 0);

    			attr_dev(line, "x2", line_x__value_1 = /*xTick*/ ctx[7] || /*isBandwidth*/ ctx[13]
    			? /*$xScale*/ ctx[14].bandwidth() / 2
    			: 0);

    			set_style(line, "stroke", /*tickColor*/ ctx[3]);
    			add_location(line, file$f, 49, 4, 1351);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, line, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*xTick, isBandwidth, $xScale*/ 24704 && line_x__value !== (line_x__value = /*xTick*/ ctx[7] || /*isBandwidth*/ ctx[13]
    			? /*$xScale*/ ctx[14].bandwidth() / 2
    			: 0)) {
    				attr_dev(line, "x1", line_x__value);
    			}

    			if (dirty & /*xTick, isBandwidth, $xScale*/ 24704 && line_x__value_1 !== (line_x__value_1 = /*xTick*/ ctx[7] || /*isBandwidth*/ ctx[13]
    			? /*$xScale*/ ctx[14].bandwidth() / 2
    			: 0)) {
    				attr_dev(line, "x2", line_x__value_1);
    			}

    			if (dirty & /*tickColor*/ 8) {
    				set_style(line, "stroke", /*tickColor*/ ctx[3]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(line);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(49:3) {#if tickMarks === true}",
    		ctx
    	});

    	return block;
    }

    // (44:1) {#each tickVals as tick, i}
    function create_each_block$2(ctx) {
    	let g;
    	let if_block0_anchor;
    	let text_1;

    	let t_value = (/*i*/ ctx[26] == /*tickVals*/ ctx[15].length - 1
    	? /*prefix*/ ctx[11] + /*formatTick*/ ctx[5](/*tick*/ ctx[24]) + /*suffix*/ ctx[12]
    	: /*formatTick*/ ctx[5](/*tick*/ ctx[24])) + "";

    	let t;
    	let text_1_x_value;
    	let text_1_text_anchor_value;
    	let g_class_value;
    	let g_transform_value;
    	let if_block0 = /*gridlines*/ ctx[0] !== false && create_if_block_1$3(ctx);
    	let if_block1 = /*tickMarks*/ ctx[2] === true && create_if_block$7(ctx);

    	const block = {
    		c: function create() {
    			g = svg_element("g");
    			if (if_block0) if_block0.c();
    			if_block0_anchor = empty();
    			if (if_block1) if_block1.c();
    			text_1 = svg_element("text");
    			t = text(t_value);

    			attr_dev(text_1, "x", text_1_x_value = /*xTick*/ ctx[7] || /*isBandwidth*/ ctx[13]
    			? /*$xScale*/ ctx[14].bandwidth() / 2
    			: 0);

    			attr_dev(text_1, "y", /*yTick*/ ctx[8]);
    			attr_dev(text_1, "dx", /*dxTick*/ ctx[9]);
    			attr_dev(text_1, "dy", /*dyTick*/ ctx[10]);
    			attr_dev(text_1, "text-anchor", text_1_text_anchor_value = /*textAnchor*/ ctx[21](/*i*/ ctx[26]));
    			set_style(text_1, "fill", /*textColor*/ ctx[4]);
    			attr_dev(text_1, "class", "svelte-r9f2bw");
    			add_location(text_1, file$f, 51, 3, 1559);
    			attr_dev(g, "class", g_class_value = "tick tick-" + /*tick*/ ctx[24] + " svelte-r9f2bw");
    			attr_dev(g, "transform", g_transform_value = "translate(" + /*$xScale*/ ctx[14](/*tick*/ ctx[24]) + "," + /*$yRange*/ ctx[16][0] + ")");
    			add_location(g, file$f, 44, 2, 1065);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);
    			if (if_block0) if_block0.m(g, null);
    			append_dev(g, if_block0_anchor);
    			if (if_block1) if_block1.m(g, null);
    			append_dev(g, text_1);
    			append_dev(text_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (/*gridlines*/ ctx[0] !== false) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1$3(ctx);
    					if_block0.c();
    					if_block0.m(g, if_block0_anchor);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*tickMarks*/ ctx[2] === true) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$7(ctx);
    					if_block1.c();
    					if_block1.m(g, text_1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*tickVals, prefix, formatTick, suffix*/ 38944 && t_value !== (t_value = (/*i*/ ctx[26] == /*tickVals*/ ctx[15].length - 1
    			? /*prefix*/ ctx[11] + /*formatTick*/ ctx[5](/*tick*/ ctx[24]) + /*suffix*/ ctx[12]
    			: /*formatTick*/ ctx[5](/*tick*/ ctx[24])) + "")) set_data_dev(t, t_value);

    			if (dirty & /*xTick, isBandwidth, $xScale*/ 24704 && text_1_x_value !== (text_1_x_value = /*xTick*/ ctx[7] || /*isBandwidth*/ ctx[13]
    			? /*$xScale*/ ctx[14].bandwidth() / 2
    			: 0)) {
    				attr_dev(text_1, "x", text_1_x_value);
    			}

    			if (dirty & /*yTick*/ 256) {
    				attr_dev(text_1, "y", /*yTick*/ ctx[8]);
    			}

    			if (dirty & /*dxTick*/ 512) {
    				attr_dev(text_1, "dx", /*dxTick*/ ctx[9]);
    			}

    			if (dirty & /*dyTick*/ 1024) {
    				attr_dev(text_1, "dy", /*dyTick*/ ctx[10]);
    			}

    			if (dirty & /*textColor*/ 16) {
    				set_style(text_1, "fill", /*textColor*/ ctx[4]);
    			}

    			if (dirty & /*tickVals*/ 32768 && g_class_value !== (g_class_value = "tick tick-" + /*tick*/ ctx[24] + " svelte-r9f2bw")) {
    				attr_dev(g, "class", g_class_value);
    			}

    			if (dirty & /*$xScale, tickVals, $yRange*/ 114688 && g_transform_value !== (g_transform_value = "translate(" + /*$xScale*/ ctx[14](/*tick*/ ctx[24]) + "," + /*$yRange*/ ctx[16][0] + ")")) {
    				attr_dev(g, "transform", g_transform_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(44:1) {#each tickVals as tick, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let g;
    	let each_value = /*tickVals*/ ctx[15];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			g = svg_element("g");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(g, "class", "axis x-axis svelte-r9f2bw");
    			toggle_class(g, "snapTicks", /*snapTicks*/ ctx[6]);
    			add_location(g, file$f, 42, 0, 992);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(g, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*tickVals, $xScale, $yRange, xTick, isBandwidth, yTick, dxTick, dyTick, textAnchor, textColor, prefix, formatTick, suffix, tickColor, tickMarks, $height, tickDashed, gridlines*/ 2359231) {
    				each_value = /*tickVals*/ ctx[15];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(g, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*snapTicks*/ 64) {
    				toggle_class(g, "snapTicks", /*snapTicks*/ ctx[6]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let isBandwidth;
    	let tickVals;
    	let $xScale;
    	let $yRange;
    	let $height;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('AxisX', slots, []);
    	const { width, height, xScale, yRange } = getContext('LayerCake');
    	validate_store(height, 'height');
    	component_subscribe($$self, height, value => $$invalidate(17, $height = value));
    	validate_store(xScale, 'xScale');
    	component_subscribe($$self, xScale, value => $$invalidate(14, $xScale = value));
    	validate_store(yRange, 'yRange');
    	component_subscribe($$self, yRange, value => $$invalidate(16, $yRange = value));
    	let { gridlines = true } = $$props;
    	let { tickDashed = false } = $$props;
    	let { tickMarks = false } = $$props;
    	let { tickColor = '#bbb' } = $$props;
    	let { textColor = '#666' } = $$props;
    	let { formatTick = d => d } = $$props;
    	let { snapTicks = false } = $$props;
    	let { ticks = undefined } = $$props;
    	let { xTick = undefined } = $$props;
    	let { yTick = 16 } = $$props;
    	let { dxTick = 0 } = $$props;
    	let { dyTick = 0 } = $$props;
    	let { prefix = '' } = $$props;
    	let { suffix = '' } = $$props;

    	function textAnchor(i) {
    		if (snapTicks === true) {
    			if (i === 0) {
    				return 'start';
    			}

    			if (i === tickVals.length - 1) {
    				return 'end';
    			}
    		}

    		return 'middle';
    	}

    	const writable_props = [
    		'gridlines',
    		'tickDashed',
    		'tickMarks',
    		'tickColor',
    		'textColor',
    		'formatTick',
    		'snapTicks',
    		'ticks',
    		'xTick',
    		'yTick',
    		'dxTick',
    		'dyTick',
    		'prefix',
    		'suffix'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<AxisX> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('gridlines' in $$props) $$invalidate(0, gridlines = $$props.gridlines);
    		if ('tickDashed' in $$props) $$invalidate(1, tickDashed = $$props.tickDashed);
    		if ('tickMarks' in $$props) $$invalidate(2, tickMarks = $$props.tickMarks);
    		if ('tickColor' in $$props) $$invalidate(3, tickColor = $$props.tickColor);
    		if ('textColor' in $$props) $$invalidate(4, textColor = $$props.textColor);
    		if ('formatTick' in $$props) $$invalidate(5, formatTick = $$props.formatTick);
    		if ('snapTicks' in $$props) $$invalidate(6, snapTicks = $$props.snapTicks);
    		if ('ticks' in $$props) $$invalidate(22, ticks = $$props.ticks);
    		if ('xTick' in $$props) $$invalidate(7, xTick = $$props.xTick);
    		if ('yTick' in $$props) $$invalidate(8, yTick = $$props.yTick);
    		if ('dxTick' in $$props) $$invalidate(9, dxTick = $$props.dxTick);
    		if ('dyTick' in $$props) $$invalidate(10, dyTick = $$props.dyTick);
    		if ('prefix' in $$props) $$invalidate(11, prefix = $$props.prefix);
    		if ('suffix' in $$props) $$invalidate(12, suffix = $$props.suffix);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		width,
    		height,
    		xScale,
    		yRange,
    		gridlines,
    		tickDashed,
    		tickMarks,
    		tickColor,
    		textColor,
    		formatTick,
    		snapTicks,
    		ticks,
    		xTick,
    		yTick,
    		dxTick,
    		dyTick,
    		prefix,
    		suffix,
    		textAnchor,
    		tickVals,
    		isBandwidth,
    		$xScale,
    		$yRange,
    		$height
    	});

    	$$self.$inject_state = $$props => {
    		if ('gridlines' in $$props) $$invalidate(0, gridlines = $$props.gridlines);
    		if ('tickDashed' in $$props) $$invalidate(1, tickDashed = $$props.tickDashed);
    		if ('tickMarks' in $$props) $$invalidate(2, tickMarks = $$props.tickMarks);
    		if ('tickColor' in $$props) $$invalidate(3, tickColor = $$props.tickColor);
    		if ('textColor' in $$props) $$invalidate(4, textColor = $$props.textColor);
    		if ('formatTick' in $$props) $$invalidate(5, formatTick = $$props.formatTick);
    		if ('snapTicks' in $$props) $$invalidate(6, snapTicks = $$props.snapTicks);
    		if ('ticks' in $$props) $$invalidate(22, ticks = $$props.ticks);
    		if ('xTick' in $$props) $$invalidate(7, xTick = $$props.xTick);
    		if ('yTick' in $$props) $$invalidate(8, yTick = $$props.yTick);
    		if ('dxTick' in $$props) $$invalidate(9, dxTick = $$props.dxTick);
    		if ('dyTick' in $$props) $$invalidate(10, dyTick = $$props.dyTick);
    		if ('prefix' in $$props) $$invalidate(11, prefix = $$props.prefix);
    		if ('suffix' in $$props) $$invalidate(12, suffix = $$props.suffix);
    		if ('tickVals' in $$props) $$invalidate(15, tickVals = $$props.tickVals);
    		if ('isBandwidth' in $$props) $$invalidate(13, isBandwidth = $$props.isBandwidth);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$xScale*/ 16384) {
    			 $$invalidate(13, isBandwidth = typeof $xScale.bandwidth === 'function');
    		}

    		if ($$self.$$.dirty & /*ticks, isBandwidth, $xScale*/ 4218880) {
    			 $$invalidate(15, tickVals = Array.isArray(ticks)
    			? ticks
    			: isBandwidth
    				? $xScale.domain()
    				: typeof ticks === 'function'
    					? ticks($xScale.ticks())
    					: $xScale.ticks(ticks));
    		}
    	};

    	return [
    		gridlines,
    		tickDashed,
    		tickMarks,
    		tickColor,
    		textColor,
    		formatTick,
    		snapTicks,
    		xTick,
    		yTick,
    		dxTick,
    		dyTick,
    		prefix,
    		suffix,
    		isBandwidth,
    		$xScale,
    		tickVals,
    		$yRange,
    		$height,
    		height,
    		xScale,
    		yRange,
    		textAnchor,
    		ticks
    	];
    }

    class AxisX extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {
    			gridlines: 0,
    			tickDashed: 1,
    			tickMarks: 2,
    			tickColor: 3,
    			textColor: 4,
    			formatTick: 5,
    			snapTicks: 6,
    			ticks: 22,
    			xTick: 7,
    			yTick: 8,
    			dxTick: 9,
    			dyTick: 10,
    			prefix: 11,
    			suffix: 12
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AxisX",
    			options,
    			id: create_fragment$g.name
    		});
    	}

    	get gridlines() {
    		throw new Error("<AxisX>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set gridlines(value) {
    		throw new Error("<AxisX>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tickDashed() {
    		throw new Error("<AxisX>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tickDashed(value) {
    		throw new Error("<AxisX>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tickMarks() {
    		throw new Error("<AxisX>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tickMarks(value) {
    		throw new Error("<AxisX>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tickColor() {
    		throw new Error("<AxisX>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tickColor(value) {
    		throw new Error("<AxisX>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get textColor() {
    		throw new Error("<AxisX>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set textColor(value) {
    		throw new Error("<AxisX>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get formatTick() {
    		throw new Error("<AxisX>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set formatTick(value) {
    		throw new Error("<AxisX>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get snapTicks() {
    		throw new Error("<AxisX>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set snapTicks(value) {
    		throw new Error("<AxisX>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ticks() {
    		throw new Error("<AxisX>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ticks(value) {
    		throw new Error("<AxisX>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get xTick() {
    		throw new Error("<AxisX>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set xTick(value) {
    		throw new Error("<AxisX>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get yTick() {
    		throw new Error("<AxisX>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set yTick(value) {
    		throw new Error("<AxisX>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dxTick() {
    		throw new Error("<AxisX>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dxTick(value) {
    		throw new Error("<AxisX>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dyTick() {
    		throw new Error("<AxisX>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dyTick(value) {
    		throw new Error("<AxisX>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prefix() {
    		throw new Error("<AxisX>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prefix(value) {
    		throw new Error("<AxisX>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get suffix() {
    		throw new Error("<AxisX>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set suffix(value) {
    		throw new Error("<AxisX>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* libs\@onsvisual\svelte-charts\src\charts\shared\AxisY.svelte generated by Svelte v3.44.1 */
    const file$g = "libs\\@onsvisual\\svelte-charts\\src\\charts\\shared\\AxisY.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[22] = list[i];
    	child_ctx[24] = i;
    	return child_ctx;
    }

    // (34:3) {#if gridlines !== false}
    function create_if_block_1$4(ctx) {
    	let line;
    	let line_y__value;
    	let line_y__value_1;

    	const block = {
    		c: function create() {
    			line = svg_element("line");
    			attr_dev(line, "class", "gridline svelte-f7wn4m");
    			attr_dev(line, "x2", "100%");

    			attr_dev(line, "y1", line_y__value = /*yTick*/ ctx[7] + (/*isBandwidth*/ ctx[13]
    			? /*$yScale*/ ctx[14].bandwidth() / 2
    			: 0));

    			attr_dev(line, "y2", line_y__value_1 = /*yTick*/ ctx[7] + (/*isBandwidth*/ ctx[13]
    			? /*$yScale*/ ctx[14].bandwidth() / 2
    			: 0));

    			set_style(line, "stroke", /*tickColor*/ ctx[3]);
    			toggle_class(line, "dashed", /*tickDashed*/ ctx[2]);
    			add_location(line, file$g, 34, 4, 1031);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, line, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*yTick, isBandwidth, $yScale*/ 24704 && line_y__value !== (line_y__value = /*yTick*/ ctx[7] + (/*isBandwidth*/ ctx[13]
    			? /*$yScale*/ ctx[14].bandwidth() / 2
    			: 0))) {
    				attr_dev(line, "y1", line_y__value);
    			}

    			if (dirty & /*yTick, isBandwidth, $yScale*/ 24704 && line_y__value_1 !== (line_y__value_1 = /*yTick*/ ctx[7] + (/*isBandwidth*/ ctx[13]
    			? /*$yScale*/ ctx[14].bandwidth() / 2
    			: 0))) {
    				attr_dev(line, "y2", line_y__value_1);
    			}

    			if (dirty & /*tickColor*/ 8) {
    				set_style(line, "stroke", /*tickColor*/ ctx[3]);
    			}

    			if (dirty & /*tickDashed*/ 4) {
    				toggle_class(line, "dashed", /*tickDashed*/ ctx[2]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(line);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(34:3) {#if gridlines !== false}",
    		ctx
    	});

    	return block;
    }

    // (44:3) {#if tickMarks === true}
    function create_if_block$8(ctx) {
    	let line;
    	let line_x__value;
    	let line_y__value;
    	let line_y__value_1;

    	const block = {
    		c: function create() {
    			line = svg_element("line");
    			attr_dev(line, "class", "tick-mark svelte-f7wn4m");
    			attr_dev(line, "x1", "0");
    			attr_dev(line, "x2", line_x__value = /*isBandwidth*/ ctx[13] ? -6 : 6);

    			attr_dev(line, "y1", line_y__value = /*yTick*/ ctx[7] + (/*isBandwidth*/ ctx[13]
    			? /*$yScale*/ ctx[14].bandwidth() / 2
    			: 0));

    			attr_dev(line, "y2", line_y__value_1 = /*yTick*/ ctx[7] + (/*isBandwidth*/ ctx[13]
    			? /*$yScale*/ ctx[14].bandwidth() / 2
    			: 0));

    			set_style(line, "stroke", /*tickColor*/ ctx[3]);
    			add_location(line, file$g, 44, 4, 1330);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, line, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*isBandwidth*/ 8192 && line_x__value !== (line_x__value = /*isBandwidth*/ ctx[13] ? -6 : 6)) {
    				attr_dev(line, "x2", line_x__value);
    			}

    			if (dirty & /*yTick, isBandwidth, $yScale*/ 24704 && line_y__value !== (line_y__value = /*yTick*/ ctx[7] + (/*isBandwidth*/ ctx[13]
    			? /*$yScale*/ ctx[14].bandwidth() / 2
    			: 0))) {
    				attr_dev(line, "y1", line_y__value);
    			}

    			if (dirty & /*yTick, isBandwidth, $yScale*/ 24704 && line_y__value_1 !== (line_y__value_1 = /*yTick*/ ctx[7] + (/*isBandwidth*/ ctx[13]
    			? /*$yScale*/ ctx[14].bandwidth() / 2
    			: 0))) {
    				attr_dev(line, "y2", line_y__value_1);
    			}

    			if (dirty & /*tickColor*/ 8) {
    				set_style(line, "stroke", /*tickColor*/ ctx[3]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(line);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(44:3) {#if tickMarks === true}",
    		ctx
    	});

    	return block;
    }

    // (32:1) {#each tickVals as tick, i}
    function create_each_block$3(ctx) {
    	let g;
    	let if_block0_anchor;
    	let text_1;

    	let t_value = (/*i*/ ctx[24] == /*tickVals*/ ctx[15].length - 1
    	? /*prefix*/ ctx[11] + /*formatTick*/ ctx[5](/*tick*/ ctx[22]) + /*suffix*/ ctx[12]
    	: /*formatTick*/ ctx[5](/*tick*/ ctx[22])) + "";

    	let t;
    	let text_1_y_value;
    	let text_1_dx_value;
    	let text_1_dy_value;
    	let g_class_value;
    	let g_transform_value;
    	let if_block0 = /*gridlines*/ ctx[1] !== false && create_if_block_1$4(ctx);
    	let if_block1 = /*tickMarks*/ ctx[0] === true && create_if_block$8(ctx);

    	const block = {
    		c: function create() {
    			g = svg_element("g");
    			if (if_block0) if_block0.c();
    			if_block0_anchor = empty();
    			if (if_block1) if_block1.c();
    			text_1 = svg_element("text");
    			t = text(t_value);
    			attr_dev(text_1, "x", /*xTick*/ ctx[6]);

    			attr_dev(text_1, "y", text_1_y_value = /*yTick*/ ctx[7] + (/*isBandwidth*/ ctx[13]
    			? /*$yScale*/ ctx[14].bandwidth() / 2
    			: 0));

    			attr_dev(text_1, "dx", text_1_dx_value = /*isBandwidth*/ ctx[13] ? -4 : /*dxTick*/ ctx[8]);
    			attr_dev(text_1, "dy", text_1_dy_value = /*isBandwidth*/ ctx[13] ? 4 : /*dyTick*/ ctx[9]);
    			set_style(text_1, "text-anchor", /*isBandwidth*/ ctx[13] ? 'end' : /*textAnchor*/ ctx[10]);
    			set_style(text_1, "fill", /*textColor*/ ctx[4]);
    			add_location(text_1, file$g, 53, 3, 1599);
    			attr_dev(g, "class", g_class_value = "tick tick-" + /*tick*/ ctx[22] + " svelte-f7wn4m");
    			attr_dev(g, "transform", g_transform_value = "translate(" + (/*$xRange*/ ctx[17][0] + (/*isBandwidth*/ ctx[13] ? /*$padding*/ ctx[16].left : 0)) + ", " + /*$yScale*/ ctx[14](/*tick*/ ctx[22]) + ")");
    			add_location(g, file$g, 32, 2, 878);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);
    			if (if_block0) if_block0.m(g, null);
    			append_dev(g, if_block0_anchor);
    			if (if_block1) if_block1.m(g, null);
    			append_dev(g, text_1);
    			append_dev(text_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (/*gridlines*/ ctx[1] !== false) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1$4(ctx);
    					if_block0.c();
    					if_block0.m(g, if_block0_anchor);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*tickMarks*/ ctx[0] === true) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$8(ctx);
    					if_block1.c();
    					if_block1.m(g, text_1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*tickVals, prefix, formatTick, suffix*/ 38944 && t_value !== (t_value = (/*i*/ ctx[24] == /*tickVals*/ ctx[15].length - 1
    			? /*prefix*/ ctx[11] + /*formatTick*/ ctx[5](/*tick*/ ctx[22]) + /*suffix*/ ctx[12]
    			: /*formatTick*/ ctx[5](/*tick*/ ctx[22])) + "")) set_data_dev(t, t_value);

    			if (dirty & /*xTick*/ 64) {
    				attr_dev(text_1, "x", /*xTick*/ ctx[6]);
    			}

    			if (dirty & /*yTick, isBandwidth, $yScale*/ 24704 && text_1_y_value !== (text_1_y_value = /*yTick*/ ctx[7] + (/*isBandwidth*/ ctx[13]
    			? /*$yScale*/ ctx[14].bandwidth() / 2
    			: 0))) {
    				attr_dev(text_1, "y", text_1_y_value);
    			}

    			if (dirty & /*isBandwidth, dxTick*/ 8448 && text_1_dx_value !== (text_1_dx_value = /*isBandwidth*/ ctx[13] ? -4 : /*dxTick*/ ctx[8])) {
    				attr_dev(text_1, "dx", text_1_dx_value);
    			}

    			if (dirty & /*isBandwidth, dyTick*/ 8704 && text_1_dy_value !== (text_1_dy_value = /*isBandwidth*/ ctx[13] ? 4 : /*dyTick*/ ctx[9])) {
    				attr_dev(text_1, "dy", text_1_dy_value);
    			}

    			if (dirty & /*isBandwidth, textAnchor*/ 9216) {
    				set_style(text_1, "text-anchor", /*isBandwidth*/ ctx[13] ? 'end' : /*textAnchor*/ ctx[10]);
    			}

    			if (dirty & /*textColor*/ 16) {
    				set_style(text_1, "fill", /*textColor*/ ctx[4]);
    			}

    			if (dirty & /*tickVals*/ 32768 && g_class_value !== (g_class_value = "tick tick-" + /*tick*/ ctx[22] + " svelte-f7wn4m")) {
    				attr_dev(g, "class", g_class_value);
    			}

    			if (dirty & /*$xRange, isBandwidth, $padding, $yScale, tickVals*/ 253952 && g_transform_value !== (g_transform_value = "translate(" + (/*$xRange*/ ctx[17][0] + (/*isBandwidth*/ ctx[13] ? /*$padding*/ ctx[16].left : 0)) + ", " + /*$yScale*/ ctx[14](/*tick*/ ctx[22]) + ")")) {
    				attr_dev(g, "transform", g_transform_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(32:1) {#each tickVals as tick, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let g;
    	let g_transform_value;
    	let each_value = /*tickVals*/ ctx[15];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			g = svg_element("g");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(g, "class", "axis y-axis");
    			attr_dev(g, "transform", g_transform_value = "translate(" + -/*$padding*/ ctx[16].left + ", 0)");
    			add_location(g, file$g, 30, 0, 778);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(g, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*tickVals, $xRange, isBandwidth, $padding, $yScale, xTick, yTick, dxTick, dyTick, textAnchor, textColor, prefix, formatTick, suffix, tickColor, tickMarks, tickDashed, gridlines*/ 262143) {
    				each_value = /*tickVals*/ ctx[15];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(g, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*$padding*/ 65536 && g_transform_value !== (g_transform_value = "translate(" + -/*$padding*/ ctx[16].left + ", 0)")) {
    				attr_dev(g, "transform", g_transform_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let isBandwidth;
    	let tickVals;
    	let $yScale;
    	let $padding;
    	let $xRange;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('AxisY', slots, []);
    	const { padding, xRange, yScale } = getContext('LayerCake');
    	validate_store(padding, 'padding');
    	component_subscribe($$self, padding, value => $$invalidate(16, $padding = value));
    	validate_store(xRange, 'xRange');
    	component_subscribe($$self, xRange, value => $$invalidate(17, $xRange = value));
    	validate_store(yScale, 'yScale');
    	component_subscribe($$self, yScale, value => $$invalidate(14, $yScale = value));
    	let { ticks = 4 } = $$props;
    	let { tickMarks = false } = $$props;
    	let { gridlines = true } = $$props;
    	let { tickDashed = false } = $$props;
    	let { tickColor = '#bbb' } = $$props;
    	let { textColor = '#666' } = $$props;
    	let { formatTick = d => d } = $$props;
    	let { xTick = 0 } = $$props;
    	let { yTick = 0 } = $$props;
    	let { dxTick = 0 } = $$props;
    	let { dyTick = -4 } = $$props;
    	let { textAnchor = 'start' } = $$props;
    	let { prefix = '' } = $$props;
    	let { suffix = '' } = $$props;

    	const writable_props = [
    		'ticks',
    		'tickMarks',
    		'gridlines',
    		'tickDashed',
    		'tickColor',
    		'textColor',
    		'formatTick',
    		'xTick',
    		'yTick',
    		'dxTick',
    		'dyTick',
    		'textAnchor',
    		'prefix',
    		'suffix'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<AxisY> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('ticks' in $$props) $$invalidate(21, ticks = $$props.ticks);
    		if ('tickMarks' in $$props) $$invalidate(0, tickMarks = $$props.tickMarks);
    		if ('gridlines' in $$props) $$invalidate(1, gridlines = $$props.gridlines);
    		if ('tickDashed' in $$props) $$invalidate(2, tickDashed = $$props.tickDashed);
    		if ('tickColor' in $$props) $$invalidate(3, tickColor = $$props.tickColor);
    		if ('textColor' in $$props) $$invalidate(4, textColor = $$props.textColor);
    		if ('formatTick' in $$props) $$invalidate(5, formatTick = $$props.formatTick);
    		if ('xTick' in $$props) $$invalidate(6, xTick = $$props.xTick);
    		if ('yTick' in $$props) $$invalidate(7, yTick = $$props.yTick);
    		if ('dxTick' in $$props) $$invalidate(8, dxTick = $$props.dxTick);
    		if ('dyTick' in $$props) $$invalidate(9, dyTick = $$props.dyTick);
    		if ('textAnchor' in $$props) $$invalidate(10, textAnchor = $$props.textAnchor);
    		if ('prefix' in $$props) $$invalidate(11, prefix = $$props.prefix);
    		if ('suffix' in $$props) $$invalidate(12, suffix = $$props.suffix);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		padding,
    		xRange,
    		yScale,
    		ticks,
    		tickMarks,
    		gridlines,
    		tickDashed,
    		tickColor,
    		textColor,
    		formatTick,
    		xTick,
    		yTick,
    		dxTick,
    		dyTick,
    		textAnchor,
    		prefix,
    		suffix,
    		isBandwidth,
    		tickVals,
    		$yScale,
    		$padding,
    		$xRange
    	});

    	$$self.$inject_state = $$props => {
    		if ('ticks' in $$props) $$invalidate(21, ticks = $$props.ticks);
    		if ('tickMarks' in $$props) $$invalidate(0, tickMarks = $$props.tickMarks);
    		if ('gridlines' in $$props) $$invalidate(1, gridlines = $$props.gridlines);
    		if ('tickDashed' in $$props) $$invalidate(2, tickDashed = $$props.tickDashed);
    		if ('tickColor' in $$props) $$invalidate(3, tickColor = $$props.tickColor);
    		if ('textColor' in $$props) $$invalidate(4, textColor = $$props.textColor);
    		if ('formatTick' in $$props) $$invalidate(5, formatTick = $$props.formatTick);
    		if ('xTick' in $$props) $$invalidate(6, xTick = $$props.xTick);
    		if ('yTick' in $$props) $$invalidate(7, yTick = $$props.yTick);
    		if ('dxTick' in $$props) $$invalidate(8, dxTick = $$props.dxTick);
    		if ('dyTick' in $$props) $$invalidate(9, dyTick = $$props.dyTick);
    		if ('textAnchor' in $$props) $$invalidate(10, textAnchor = $$props.textAnchor);
    		if ('prefix' in $$props) $$invalidate(11, prefix = $$props.prefix);
    		if ('suffix' in $$props) $$invalidate(12, suffix = $$props.suffix);
    		if ('isBandwidth' in $$props) $$invalidate(13, isBandwidth = $$props.isBandwidth);
    		if ('tickVals' in $$props) $$invalidate(15, tickVals = $$props.tickVals);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$yScale*/ 16384) {
    			 $$invalidate(13, isBandwidth = typeof $yScale.bandwidth === 'function');
    		}

    		if ($$self.$$.dirty & /*ticks, isBandwidth, $yScale*/ 2121728) {
    			 $$invalidate(15, tickVals = Array.isArray(ticks)
    			? ticks
    			: isBandwidth
    				? $yScale.domain()
    				: typeof ticks === 'function'
    					? ticks($yScale.ticks())
    					: $yScale.ticks(ticks));
    		}
    	};

    	return [
    		tickMarks,
    		gridlines,
    		tickDashed,
    		tickColor,
    		textColor,
    		formatTick,
    		xTick,
    		yTick,
    		dxTick,
    		dyTick,
    		textAnchor,
    		prefix,
    		suffix,
    		isBandwidth,
    		$yScale,
    		tickVals,
    		$padding,
    		$xRange,
    		padding,
    		xRange,
    		yScale,
    		ticks
    	];
    }

    class AxisY extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {
    			ticks: 21,
    			tickMarks: 0,
    			gridlines: 1,
    			tickDashed: 2,
    			tickColor: 3,
    			textColor: 4,
    			formatTick: 5,
    			xTick: 6,
    			yTick: 7,
    			dxTick: 8,
    			dyTick: 9,
    			textAnchor: 10,
    			prefix: 11,
    			suffix: 12
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AxisY",
    			options,
    			id: create_fragment$h.name
    		});
    	}

    	get ticks() {
    		throw new Error("<AxisY>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ticks(value) {
    		throw new Error("<AxisY>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tickMarks() {
    		throw new Error("<AxisY>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tickMarks(value) {
    		throw new Error("<AxisY>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get gridlines() {
    		throw new Error("<AxisY>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set gridlines(value) {
    		throw new Error("<AxisY>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tickDashed() {
    		throw new Error("<AxisY>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tickDashed(value) {
    		throw new Error("<AxisY>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tickColor() {
    		throw new Error("<AxisY>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tickColor(value) {
    		throw new Error("<AxisY>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get textColor() {
    		throw new Error("<AxisY>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set textColor(value) {
    		throw new Error("<AxisY>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get formatTick() {
    		throw new Error("<AxisY>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set formatTick(value) {
    		throw new Error("<AxisY>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get xTick() {
    		throw new Error("<AxisY>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set xTick(value) {
    		throw new Error("<AxisY>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get yTick() {
    		throw new Error("<AxisY>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set yTick(value) {
    		throw new Error("<AxisY>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dxTick() {
    		throw new Error("<AxisY>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dxTick(value) {
    		throw new Error("<AxisY>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dyTick() {
    		throw new Error("<AxisY>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dyTick(value) {
    		throw new Error("<AxisY>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get textAnchor() {
    		throw new Error("<AxisY>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set textAnchor(value) {
    		throw new Error("<AxisY>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prefix() {
    		throw new Error("<AxisY>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prefix(value) {
    		throw new Error("<AxisY>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get suffix() {
    		throw new Error("<AxisY>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set suffix(value) {
    		throw new Error("<AxisY>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* libs\@onsvisual\svelte-charts\src\charts\shared\Legend.svelte generated by Svelte v3.44.1 */

    const file$h = "libs\\@onsvisual\\svelte-charts\\src\\charts\\shared\\Legend.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	child_ctx[10] = i;
    	return child_ctx;
    }

    // (12:0) {#if Array.isArray(domain) && Array.isArray(colors)}
    function create_if_block$9(ctx) {
    	let ul;
    	let each_value = /*domain*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "class", "legend svelte-1w19nmy");
    			add_location(ul, file$h, 12, 2, 495);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*domain, colors, horizontal, line, comparison, markerWidth, markerLength, round*/ 255) {
    				each_value = /*domain*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$9.name,
    		type: "if",
    		source: "(12:0) {#if Array.isArray(domain) && Array.isArray(colors)}",
    		ctx
    	});

    	return block;
    }

    // (14:4) {#each domain as label, i}
    function create_each_block$4(ctx) {
    	let li;
    	let div;
    	let t0;
    	let t1_value = /*label*/ ctx[8] + "";
    	let t1;
    	let t2;

    	const block = {
    		c: function create() {
    			li = element("li");
    			div = element("div");
    			t0 = space();
    			t1 = text(t1_value);
    			t2 = space();
    			attr_dev(div, "class", "bullet svelte-1w19nmy");
    			set_style(div, "background-color", /*colors*/ ctx[1][/*i*/ ctx[10]]);

    			set_style(div, "width", (!/*horizontal*/ ctx[4] && (/*line*/ ctx[2] || /*comparison*/ ctx[3] && /*i*/ ctx[10] != 0)
    			? /*markerWidth*/ ctx[5]
    			: /*markerLength*/ ctx[6]) + "px");

    			set_style(div, "height", (/*horizontal*/ ctx[4] && (/*line*/ ctx[2] || /*comparison*/ ctx[3] && /*i*/ ctx[10] != 0)
    			? /*markerWidth*/ ctx[5]
    			: /*markerLength*/ ctx[6]) + "px");

    			toggle_class(div, "round", /*round*/ ctx[7]);
    			add_location(div, file$h, 15, 8, 568);
    			attr_dev(li, "class", "svelte-1w19nmy");
    			add_location(li, file$h, 14, 6, 554);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, div);
    			append_dev(li, t0);
    			append_dev(li, t1);
    			append_dev(li, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*colors*/ 2) {
    				set_style(div, "background-color", /*colors*/ ctx[1][/*i*/ ctx[10]]);
    			}

    			if (dirty & /*horizontal, line, comparison, markerWidth, markerLength*/ 124) {
    				set_style(div, "width", (!/*horizontal*/ ctx[4] && (/*line*/ ctx[2] || /*comparison*/ ctx[3] && /*i*/ ctx[10] != 0)
    				? /*markerWidth*/ ctx[5]
    				: /*markerLength*/ ctx[6]) + "px");
    			}

    			if (dirty & /*horizontal, line, comparison, markerWidth, markerLength*/ 124) {
    				set_style(div, "height", (/*horizontal*/ ctx[4] && (/*line*/ ctx[2] || /*comparison*/ ctx[3] && /*i*/ ctx[10] != 0)
    				? /*markerWidth*/ ctx[5]
    				: /*markerLength*/ ctx[6]) + "px");
    			}

    			if (dirty & /*round*/ 128) {
    				toggle_class(div, "round", /*round*/ ctx[7]);
    			}

    			if (dirty & /*domain*/ 1 && t1_value !== (t1_value = /*label*/ ctx[8] + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(14:4) {#each domain as label, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$i(ctx) {
    	let show_if = Array.isArray(/*domain*/ ctx[0]) && Array.isArray(/*colors*/ ctx[1]);
    	let if_block_anchor;
    	let if_block = show_if && create_if_block$9(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*domain, colors*/ 3) show_if = Array.isArray(/*domain*/ ctx[0]) && Array.isArray(/*colors*/ ctx[1]);

    			if (show_if) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$9(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Legend', slots, []);
    	let { domain = null } = $$props;
    	let { colors = null } = $$props;
    	let { line = false } = $$props;
    	let { comparison = false } = $$props;
    	let { horizontal = true } = $$props;
    	let { markerWidth = 2.5 } = $$props;
    	let { markerLength = 13 } = $$props;
    	let { round = false } = $$props;

    	const writable_props = [
    		'domain',
    		'colors',
    		'line',
    		'comparison',
    		'horizontal',
    		'markerWidth',
    		'markerLength',
    		'round'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Legend> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('domain' in $$props) $$invalidate(0, domain = $$props.domain);
    		if ('colors' in $$props) $$invalidate(1, colors = $$props.colors);
    		if ('line' in $$props) $$invalidate(2, line = $$props.line);
    		if ('comparison' in $$props) $$invalidate(3, comparison = $$props.comparison);
    		if ('horizontal' in $$props) $$invalidate(4, horizontal = $$props.horizontal);
    		if ('markerWidth' in $$props) $$invalidate(5, markerWidth = $$props.markerWidth);
    		if ('markerLength' in $$props) $$invalidate(6, markerLength = $$props.markerLength);
    		if ('round' in $$props) $$invalidate(7, round = $$props.round);
    	};

    	$$self.$capture_state = () => ({
    		domain,
    		colors,
    		line,
    		comparison,
    		horizontal,
    		markerWidth,
    		markerLength,
    		round
    	});

    	$$self.$inject_state = $$props => {
    		if ('domain' in $$props) $$invalidate(0, domain = $$props.domain);
    		if ('colors' in $$props) $$invalidate(1, colors = $$props.colors);
    		if ('line' in $$props) $$invalidate(2, line = $$props.line);
    		if ('comparison' in $$props) $$invalidate(3, comparison = $$props.comparison);
    		if ('horizontal' in $$props) $$invalidate(4, horizontal = $$props.horizontal);
    		if ('markerWidth' in $$props) $$invalidate(5, markerWidth = $$props.markerWidth);
    		if ('markerLength' in $$props) $$invalidate(6, markerLength = $$props.markerLength);
    		if ('round' in $$props) $$invalidate(7, round = $$props.round);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [domain, colors, line, comparison, horizontal, markerWidth, markerLength, round];
    }

    class Legend extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {
    			domain: 0,
    			colors: 1,
    			line: 2,
    			comparison: 3,
    			horizontal: 4,
    			markerWidth: 5,
    			markerLength: 6,
    			round: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Legend",
    			options,
    			id: create_fragment$i.name
    		});
    	}

    	get domain() {
    		throw new Error("<Legend>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set domain(value) {
    		throw new Error("<Legend>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get colors() {
    		throw new Error("<Legend>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set colors(value) {
    		throw new Error("<Legend>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get line() {
    		throw new Error("<Legend>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set line(value) {
    		throw new Error("<Legend>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get comparison() {
    		throw new Error("<Legend>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set comparison(value) {
    		throw new Error("<Legend>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get horizontal() {
    		throw new Error("<Legend>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set horizontal(value) {
    		throw new Error("<Legend>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get markerWidth() {
    		throw new Error("<Legend>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set markerWidth(value) {
    		throw new Error("<Legend>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get markerLength() {
    		throw new Error("<Legend>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set markerLength(value) {
    		throw new Error("<Legend>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get round() {
    		throw new Error("<Legend>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set round(value) {
    		throw new Error("<Legend>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* libs\@onsvisual\svelte-charts\src\charts\shared\Title.svelte generated by Svelte v3.44.1 */

    const file$i = "libs\\@onsvisual\\svelte-charts\\src\\charts\\shared\\Title.svelte";

    function create_fragment$j(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "title svelte-b06b69");
    			add_location(div, file$i, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 1)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[0],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[0])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[0], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Title', slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Title> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class Title extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Title",
    			options,
    			id: create_fragment$j.name
    		});
    	}
    }

    /* libs\@onsvisual\svelte-charts\src\charts\shared\Footer.svelte generated by Svelte v3.44.1 */

    const file$j = "libs\\@onsvisual\\svelte-charts\\src\\charts\\shared\\Footer.svelte";

    function create_fragment$k(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "footer svelte-7jvwfp");
    			add_location(div, file$j, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 1)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[0],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[0])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[0], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Footer', slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$k.name
    		});
    	}
    }

    /* libs\@onsvisual\svelte-charts\src\charts\shared\Labels.svelte generated by Svelte v3.44.1 */
    const file$k = "libs\\@onsvisual\\svelte-charts\\src\\charts\\shared\\Labels.svelte";

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	child_ctx[16] = i;
    	return child_ctx;
    }

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	child_ctx[16] = i;
    	return child_ctx;
    }

    // (16:0) {#if $coords}
    function create_if_block$a(ctx) {
    	let defs;
    	let filter;
    	let feFlood;
    	let feMerge;
    	let feMergeNode0;
    	let feMergeNode1;
    	let t;
    	let g;

    	function select_block_type(ctx, dirty) {
    		if (/*$coords*/ ctx[2][0] && /*$coords*/ ctx[2][0].x) return create_if_block_1$5;
    		if (/*$coords*/ ctx[2][0] && /*$coords*/ ctx[2][0][0] && /*$coords*/ ctx[2][0][0].x) return create_if_block_3;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			defs = svg_element("defs");
    			filter = svg_element("filter");
    			feFlood = svg_element("feFlood");
    			feMerge = svg_element("feMerge");
    			feMergeNode0 = svg_element("feMergeNode");
    			feMergeNode1 = svg_element("feMergeNode");
    			t = space();
    			g = svg_element("g");
    			if (if_block) if_block.c();
    			attr_dev(feFlood, "flood-color", "rgba(255,255,255,0.8)");
    			attr_dev(feFlood, "result", "bg");
    			add_location(feFlood, file$k, 18, 2, 524);
    			attr_dev(feMergeNode0, "in", "bg");
    			add_location(feMergeNode0, file$k, 20, 3, 601);
    			attr_dev(feMergeNode1, "in", "SourceGraphic");
    			add_location(feMergeNode1, file$k, 21, 3, 628);
    			add_location(feMerge, file$k, 19, 2, 587);
    			attr_dev(filter, "x", "0");
    			attr_dev(filter, "y", "0");
    			attr_dev(filter, "width", "1");
    			attr_dev(filter, "height", "1");
    			attr_dev(filter, "id", "bgfill");
    			add_location(filter, file$k, 17, 1, 467);
    			add_location(defs, file$k, 16, 0, 458);
    			attr_dev(g, "class", "label-group");
    			add_location(g, file$k, 25, 0, 698);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, defs, anchor);
    			append_dev(defs, filter);
    			append_dev(filter, feFlood);
    			append_dev(filter, feMerge);
    			append_dev(feMerge, feMergeNode0);
    			append_dev(feMerge, feMergeNode1);
    			insert_dev(target, t, anchor);
    			insert_dev(target, g, anchor);
    			if (if_block) if_block.m(g, null);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(g, null);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(defs);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(g);

    			if (if_block) {
    				if_block.d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$a.name,
    		type: "if",
    		source: "(16:0) {#if $coords}",
    		ctx
    	});

    	return block;
    }

    // (41:58) 
    function create_if_block_3(ctx) {
    	let each_1_anchor;
    	let each_value_1 = /*$coords*/ ctx[2];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$xScale, $coords, $yScale, $data, labelKey, hovered, selected, idKey*/ 6207) {
    				each_value_1 = /*$coords*/ ctx[2];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(41:58) ",
    		ctx
    	});

    	return block;
    }

    // (27:1) {#if $coords[0] && $coords[0].x}
    function create_if_block_1$5(ctx) {
    	let each_1_anchor;
    	let each_value = /*$coords*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$xScale, $coords, $yScale, $data, labelKey, hovered, selected, idKey*/ 6207) {
    				each_value = /*$coords*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$5.name,
    		type: "if",
    		source: "(27:1) {#if $coords[0] && $coords[0].x}",
    		ctx
    	});

    	return block;
    }

    // (43:2) {#if [hovered, selected].includes($data[i][0][idKey])}
    function create_if_block_4(ctx) {
    	let text_1;
    	let t_value = /*$data*/ ctx[3][/*i*/ ctx[16]][0][/*labelKey*/ ctx[12]] + "";
    	let t;
    	let text_1_x_value;
    	let text_1_y_value;

    	const block = {
    		c: function create() {
    			text_1 = svg_element("text");
    			t = text(t_value);
    			attr_dev(text_1, "class", "label svelte-1ijkebl");
    			attr_dev(text_1, "transform", "translate(2,3)");
    			attr_dev(text_1, "filter", "url(#bgfill)");
    			attr_dev(text_1, "fill", "#333");
    			attr_dev(text_1, "x", text_1_x_value = /*$xScale*/ ctx[4](/*d*/ ctx[14][/*d*/ ctx[14].length - 1].x));
    			attr_dev(text_1, "y", text_1_y_value = /*$yScale*/ ctx[5](/*d*/ ctx[14][/*d*/ ctx[14].length - 1].y));
    			add_location(text_1, file$k, 43, 2, 1185);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, text_1, anchor);
    			append_dev(text_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$data*/ 8 && t_value !== (t_value = /*$data*/ ctx[3][/*i*/ ctx[16]][0][/*labelKey*/ ctx[12]] + "")) set_data_dev(t, t_value);

    			if (dirty & /*$xScale, $coords*/ 20 && text_1_x_value !== (text_1_x_value = /*$xScale*/ ctx[4](/*d*/ ctx[14][/*d*/ ctx[14].length - 1].x))) {
    				attr_dev(text_1, "x", text_1_x_value);
    			}

    			if (dirty & /*$yScale, $coords*/ 36 && text_1_y_value !== (text_1_y_value = /*$yScale*/ ctx[5](/*d*/ ctx[14][/*d*/ ctx[14].length - 1].y))) {
    				attr_dev(text_1, "y", text_1_y_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(text_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(43:2) {#if [hovered, selected].includes($data[i][0][idKey])}",
    		ctx
    	});

    	return block;
    }

    // (42:1) {#each $coords as d, i}
    function create_each_block_1$1(ctx) {
    	let show_if = [/*hovered*/ ctx[0], /*selected*/ ctx[1]].includes(/*$data*/ ctx[3][/*i*/ ctx[16]][0][/*idKey*/ ctx[11]]);
    	let if_block_anchor;
    	let if_block = show_if && create_if_block_4(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*hovered, selected, $data*/ 11) show_if = [/*hovered*/ ctx[0], /*selected*/ ctx[1]].includes(/*$data*/ ctx[3][/*i*/ ctx[16]][0][/*idKey*/ ctx[11]]);

    			if (show_if) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_4(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(42:1) {#each $coords as d, i}",
    		ctx
    	});

    	return block;
    }

    // (29:2) {#if [hovered, selected].includes($data[i][idKey])}
    function create_if_block_2$1(ctx) {
    	let text_1;
    	let t_value = /*$data*/ ctx[3][/*i*/ ctx[16]][/*labelKey*/ ctx[12]] + "";
    	let t;
    	let text_1_x_value;
    	let text_1_y_value;

    	const block = {
    		c: function create() {
    			text_1 = svg_element("text");
    			t = text(t_value);
    			attr_dev(text_1, "class", "label svelte-1ijkebl");
    			attr_dev(text_1, "transform", "translate(5,-5)");
    			attr_dev(text_1, "filter", "url(#bgfill)");
    			attr_dev(text_1, "fill", "#333");
    			attr_dev(text_1, "x", text_1_x_value = /*$xScale*/ ctx[4](/*d*/ ctx[14].x));
    			attr_dev(text_1, "y", text_1_y_value = /*$yScale*/ ctx[5](/*d*/ ctx[14].y));
    			add_location(text_1, file$k, 29, 2, 841);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, text_1, anchor);
    			append_dev(text_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$data*/ 8 && t_value !== (t_value = /*$data*/ ctx[3][/*i*/ ctx[16]][/*labelKey*/ ctx[12]] + "")) set_data_dev(t, t_value);

    			if (dirty & /*$xScale, $coords*/ 20 && text_1_x_value !== (text_1_x_value = /*$xScale*/ ctx[4](/*d*/ ctx[14].x))) {
    				attr_dev(text_1, "x", text_1_x_value);
    			}

    			if (dirty & /*$yScale, $coords*/ 36 && text_1_y_value !== (text_1_y_value = /*$yScale*/ ctx[5](/*d*/ ctx[14].y))) {
    				attr_dev(text_1, "y", text_1_y_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(text_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(29:2) {#if [hovered, selected].includes($data[i][idKey])}",
    		ctx
    	});

    	return block;
    }

    // (28:1) {#each $coords as d, i}
    function create_each_block$5(ctx) {
    	let show_if = [/*hovered*/ ctx[0], /*selected*/ ctx[1]].includes(/*$data*/ ctx[3][/*i*/ ctx[16]][/*idKey*/ ctx[11]]);
    	let if_block_anchor;
    	let if_block = show_if && create_if_block_2$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*hovered, selected, $data*/ 11) show_if = [/*hovered*/ ctx[0], /*selected*/ ctx[1]].includes(/*$data*/ ctx[3][/*i*/ ctx[16]][/*idKey*/ ctx[11]]);

    			if (show_if) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_2$1(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(28:1) {#each $coords as d, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$l(ctx) {
    	let if_block_anchor;
    	let if_block = /*$coords*/ ctx[2] && create_if_block$a(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$coords*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$a(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$l($$self, $$props, $$invalidate) {
    	let $custom;
    	let $coords;
    	let $data;
    	let $xScale;
    	let $yScale;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Labels', slots, []);
    	const { data, xScale, yScale, custom } = getContext('LayerCake');
    	validate_store(data, 'data');
    	component_subscribe($$self, data, value => $$invalidate(3, $data = value));
    	validate_store(xScale, 'xScale');
    	component_subscribe($$self, xScale, value => $$invalidate(4, $xScale = value));
    	validate_store(yScale, 'yScale');
    	component_subscribe($$self, yScale, value => $$invalidate(5, $yScale = value));
    	validate_store(custom, 'custom');
    	component_subscribe($$self, custom, value => $$invalidate(13, $custom = value));
    	let { hovered = null } = $$props;
    	let { selected = null } = $$props;
    	let coords = $custom.coords;
    	validate_store(coords, 'coords');
    	component_subscribe($$self, coords, value => $$invalidate(2, $coords = value));
    	let idKey = $custom.idKey;
    	let labelKey = $custom.labelKey;
    	const writable_props = ['hovered', 'selected'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Labels> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('hovered' in $$props) $$invalidate(0, hovered = $$props.hovered);
    		if ('selected' in $$props) $$invalidate(1, selected = $$props.selected);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		data,
    		xScale,
    		yScale,
    		custom,
    		hovered,
    		selected,
    		coords,
    		idKey,
    		labelKey,
    		$custom,
    		$coords,
    		$data,
    		$xScale,
    		$yScale
    	});

    	$$self.$inject_state = $$props => {
    		if ('hovered' in $$props) $$invalidate(0, hovered = $$props.hovered);
    		if ('selected' in $$props) $$invalidate(1, selected = $$props.selected);
    		if ('coords' in $$props) $$invalidate(10, coords = $$props.coords);
    		if ('idKey' in $$props) $$invalidate(11, idKey = $$props.idKey);
    		if ('labelKey' in $$props) $$invalidate(12, labelKey = $$props.labelKey);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		hovered,
    		selected,
    		$coords,
    		$data,
    		$xScale,
    		$yScale,
    		data,
    		xScale,
    		yScale,
    		custom,
    		coords,
    		idKey,
    		labelKey
    	];
    }

    class Labels extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$l, create_fragment$l, safe_not_equal, { hovered: 0, selected: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Labels",
    			options,
    			id: create_fragment$l.name
    		});
    	}

    	get hovered() {
    		throw new Error("<Labels>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hovered(value) {
    		throw new Error("<Labels>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selected() {
    		throw new Error("<Labels>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selected(value) {
    		throw new Error("<Labels>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* libs\@onsvisual\svelte-charts\src\charts\LineChart.svelte generated by Svelte v3.44.1 */

    const { console: console_1$3 } = globals;
    const file$l = "libs\\@onsvisual\\svelte-charts\\src\\charts\\LineChart.svelte";
    const get_front_slot_changes = dirty => ({});
    const get_front_slot_context = ctx => ({});
    const get_svg_slot_changes = dirty => ({});
    const get_svg_slot_context = ctx => ({});
    const get_back_slot_changes = dirty => ({});
    const get_back_slot_context = ctx => ({});
    const get_options_slot_changes = dirty => ({});
    const get_options_slot_context = ctx => ({});

    // (145:0) {#if title}
    function create_if_block_8(ctx) {
    	let title_1;
    	let current;

    	title_1 = new Title({
    			props: {
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(title_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(title_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const title_1_changes = {};

    			if (dirty[0] & /*title*/ 131072 | dirty[1] & /*$$scope*/ 33554432) {
    				title_1_changes.$$scope = { dirty, ctx };
    			}

    			title_1.$set(title_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(title_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(title_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(title_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(145:0) {#if title}",
    		ctx
    	});

    	return block;
    }

    // (146:2) <Title>
    function create_default_slot_3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*title*/ ctx[17]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*title*/ 131072) set_data_dev(t, /*title*/ ctx[17]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(146:2) <Title>",
    		ctx
    	});

    	return block;
    }

    // (182:4) {#if width > 80}
    function create_if_block_2$2(ctx) {
    	let t0;
    	let svg;
    	let t1;
    	let current;
    	const back_slot_template = /*#slots*/ ctx[51].back;
    	const back_slot = create_slot(back_slot_template, ctx, /*$$scope*/ ctx[56], get_back_slot_context);

    	svg = new Svg({
    			props: {
    				pointerEvents: /*interactive*/ ctx[29],
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const front_slot_template = /*#slots*/ ctx[51].front;
    	const front_slot = create_slot(front_slot_template, ctx, /*$$scope*/ ctx[56], get_front_slot_context);

    	const block = {
    		c: function create() {
    			if (back_slot) back_slot.c();
    			t0 = space();
    			create_component(svg.$$.fragment);
    			t1 = space();
    			if (front_slot) front_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (back_slot) {
    				back_slot.m(target, anchor);
    			}

    			insert_dev(target, t0, anchor);
    			mount_component(svg, target, anchor);
    			insert_dev(target, t1, anchor);

    			if (front_slot) {
    				front_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (back_slot) {
    				if (back_slot.p && (!current || dirty[1] & /*$$scope*/ 33554432)) {
    					update_slot_base(
    						back_slot,
    						back_slot_template,
    						ctx,
    						/*$$scope*/ ctx[56],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[56])
    						: get_slot_changes(back_slot_template, /*$$scope*/ ctx[56], dirty, get_back_slot_changes),
    						get_back_slot_context
    					);
    				}
    			}

    			const svg_changes = {};
    			if (dirty[0] & /*interactive*/ 536870912) svg_changes.pointerEvents = /*interactive*/ ctx[29];

    			if (dirty[0] & /*hovered, selected, labels, lineWidth, line, mode, areaOpacity, area, yTicks, yFormatTick, yAxis, xTicks, snapTicks, xPrefix, xAxis*/ 1408364547 | dirty[1] & /*$$scope, select, hover, highlighted, yPrefix, ySuffix, xSuffix*/ 33554607) {
    				svg_changes.$$scope = { dirty, ctx };
    			}

    			svg.$set(svg_changes);

    			if (front_slot) {
    				if (front_slot.p && (!current || dirty[1] & /*$$scope*/ 33554432)) {
    					update_slot_base(
    						front_slot,
    						front_slot_template,
    						ctx,
    						/*$$scope*/ ctx[56],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[56])
    						: get_slot_changes(front_slot_template, /*$$scope*/ ctx[56], dirty, get_front_slot_changes),
    						get_front_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(back_slot, local);
    			transition_in(svg.$$.fragment, local);
    			transition_in(front_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(back_slot, local);
    			transition_out(svg.$$.fragment, local);
    			transition_out(front_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (back_slot) back_slot.d(detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(svg, detaching);
    			if (detaching) detach_dev(t1);
    			if (front_slot) front_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(182:4) {#if width > 80}",
    		ctx
    	});

    	return block;
    }

    // (187:8) {#if xAxis}
    function create_if_block_7(ctx) {
    	let axisx;
    	let current;

    	axisx = new AxisX({
    			props: {
    				ticks: /*xTicks*/ ctx[15],
    				snapTicks: /*snapTicks*/ ctx[21],
    				prefix: /*xPrefix*/ ctx[30],
    				suffix: /*xSuffix*/ ctx[31]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(axisx.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(axisx, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const axisx_changes = {};
    			if (dirty[0] & /*xTicks*/ 32768) axisx_changes.ticks = /*xTicks*/ ctx[15];
    			if (dirty[0] & /*snapTicks*/ 2097152) axisx_changes.snapTicks = /*snapTicks*/ ctx[21];
    			if (dirty[0] & /*xPrefix*/ 1073741824) axisx_changes.prefix = /*xPrefix*/ ctx[30];
    			if (dirty[1] & /*xSuffix*/ 1) axisx_changes.suffix = /*xSuffix*/ ctx[31];
    			axisx.$set(axisx_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(axisx.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(axisx.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(axisx, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(187:8) {#if xAxis}",
    		ctx
    	});

    	return block;
    }

    // (190:8) {#if yAxis}
    function create_if_block_6(ctx) {
    	let axisy;
    	let current;

    	axisy = new AxisY({
    			props: {
    				ticks: /*yTicks*/ ctx[16],
    				formatTick: /*yFormatTick*/ ctx[12],
    				prefix: /*yPrefix*/ ctx[32],
    				suffix: /*ySuffix*/ ctx[33]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(axisy.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(axisy, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const axisy_changes = {};
    			if (dirty[0] & /*yTicks*/ 65536) axisy_changes.ticks = /*yTicks*/ ctx[16];
    			if (dirty[0] & /*yFormatTick*/ 4096) axisy_changes.formatTick = /*yFormatTick*/ ctx[12];
    			if (dirty[1] & /*yPrefix*/ 2) axisy_changes.prefix = /*yPrefix*/ ctx[32];
    			if (dirty[1] & /*ySuffix*/ 4) axisy_changes.suffix = /*ySuffix*/ ctx[33];
    			axisy.$set(axisy_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(axisy.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(axisy.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(axisy, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(190:8) {#if yAxis}",
    		ctx
    	});

    	return block;
    }

    // (198:8) {#if area}
    function create_if_block_5(ctx) {
    	let area_1;
    	let current;

    	area_1 = new Area({
    			props: {
    				mode: /*mode*/ ctx[24],
    				opacity: /*areaOpacity*/ ctx[25]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(area_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(area_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const area_1_changes = {};
    			if (dirty[0] & /*mode*/ 16777216) area_1_changes.mode = /*mode*/ ctx[24];
    			if (dirty[0] & /*areaOpacity*/ 33554432) area_1_changes.opacity = /*areaOpacity*/ ctx[25];
    			area_1.$set(area_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(area_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(area_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(area_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(198:8) {#if area}",
    		ctx
    	});

    	return block;
    }

    // (201:8) {#if line}
    function create_if_block_4$1(ctx) {
    	let line_1;
    	let updating_selected;
    	let updating_hovered;
    	let current;

    	function line_1_selected_binding(value) {
    		/*line_1_selected_binding*/ ctx[52](value);
    	}

    	function line_1_hovered_binding(value) {
    		/*line_1_hovered_binding*/ ctx[53](value);
    	}

    	let line_1_props = {
    		lineWidth: /*lineWidth*/ ctx[28],
    		select: /*select*/ ctx[36],
    		hover: /*hover*/ ctx[34],
    		highlighted: /*highlighted*/ ctx[38]
    	};

    	if (/*selected*/ ctx[1] !== void 0) {
    		line_1_props.selected = /*selected*/ ctx[1];
    	}

    	if (/*hovered*/ ctx[0] !== void 0) {
    		line_1_props.hovered = /*hovered*/ ctx[0];
    	}

    	line_1 = new Line({ props: line_1_props, $$inline: true });
    	binding_callbacks.push(() => bind(line_1, 'selected', line_1_selected_binding));
    	binding_callbacks.push(() => bind(line_1, 'hovered', line_1_hovered_binding));
    	line_1.$on("hover", /*hover_handler*/ ctx[54]);
    	line_1.$on("select", /*select_handler*/ ctx[55]);

    	const block = {
    		c: function create() {
    			create_component(line_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(line_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const line_1_changes = {};
    			if (dirty[0] & /*lineWidth*/ 268435456) line_1_changes.lineWidth = /*lineWidth*/ ctx[28];
    			if (dirty[1] & /*select*/ 32) line_1_changes.select = /*select*/ ctx[36];
    			if (dirty[1] & /*hover*/ 8) line_1_changes.hover = /*hover*/ ctx[34];
    			if (dirty[1] & /*highlighted*/ 128) line_1_changes.highlighted = /*highlighted*/ ctx[38];

    			if (!updating_selected && dirty[0] & /*selected*/ 2) {
    				updating_selected = true;
    				line_1_changes.selected = /*selected*/ ctx[1];
    				add_flush_callback(() => updating_selected = false);
    			}

    			if (!updating_hovered && dirty[0] & /*hovered*/ 1) {
    				updating_hovered = true;
    				line_1_changes.hovered = /*hovered*/ ctx[0];
    				add_flush_callback(() => updating_hovered = false);
    			}

    			line_1.$set(line_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(line_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(line_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(line_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(201:8) {#if line}",
    		ctx
    	});

    	return block;
    }

    // (213:8) {#if labels}
    function create_if_block_3$1(ctx) {
    	let labels_1;
    	let current;

    	labels_1 = new Labels({
    			props: {
    				hovered: /*hovered*/ ctx[0],
    				selected: /*selected*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(labels_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(labels_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const labels_1_changes = {};
    			if (dirty[0] & /*hovered*/ 1) labels_1_changes.hovered = /*hovered*/ ctx[0];
    			if (dirty[0] & /*selected*/ 2) labels_1_changes.selected = /*selected*/ ctx[1];
    			labels_1.$set(labels_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(labels_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(labels_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(labels_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(213:8) {#if labels}",
    		ctx
    	});

    	return block;
    }

    // (186:6) <Svg pointerEvents={interactive}>
    function create_default_slot_2(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let current;
    	let if_block0 = /*xAxis*/ ctx[13] && create_if_block_7(ctx);
    	let if_block1 = /*yAxis*/ ctx[14] && create_if_block_6(ctx);
    	let if_block2 = /*area*/ ctx[23] && create_if_block_5(ctx);
    	let if_block3 = /*line*/ ctx[22] && create_if_block_4$1(ctx);
    	let if_block4 = /*labels*/ ctx[20] && create_if_block_3$1(ctx);
    	const svg_slot_template = /*#slots*/ ctx[51].svg;
    	const svg_slot = create_slot(svg_slot_template, ctx, /*$$scope*/ ctx[56], get_svg_slot_context);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();
    			if (if_block3) if_block3.c();
    			t3 = space();
    			if (if_block4) if_block4.c();
    			t4 = space();
    			if (svg_slot) svg_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, t2, anchor);
    			if (if_block3) if_block3.m(target, anchor);
    			insert_dev(target, t3, anchor);
    			if (if_block4) if_block4.m(target, anchor);
    			insert_dev(target, t4, anchor);

    			if (svg_slot) {
    				svg_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*xAxis*/ ctx[13]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*xAxis*/ 8192) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_7(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*yAxis*/ ctx[14]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*yAxis*/ 16384) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_6(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(t1.parentNode, t1);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*area*/ ctx[23]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty[0] & /*area*/ 8388608) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_5(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(t2.parentNode, t2);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (/*line*/ ctx[22]) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);

    					if (dirty[0] & /*line*/ 4194304) {
    						transition_in(if_block3, 1);
    					}
    				} else {
    					if_block3 = create_if_block_4$1(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(t3.parentNode, t3);
    				}
    			} else if (if_block3) {
    				group_outros();

    				transition_out(if_block3, 1, 1, () => {
    					if_block3 = null;
    				});

    				check_outros();
    			}

    			if (/*labels*/ ctx[20]) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);

    					if (dirty[0] & /*labels*/ 1048576) {
    						transition_in(if_block4, 1);
    					}
    				} else {
    					if_block4 = create_if_block_3$1(ctx);
    					if_block4.c();
    					transition_in(if_block4, 1);
    					if_block4.m(t4.parentNode, t4);
    				}
    			} else if (if_block4) {
    				group_outros();

    				transition_out(if_block4, 1, 1, () => {
    					if_block4 = null;
    				});

    				check_outros();
    			}

    			if (svg_slot) {
    				if (svg_slot.p && (!current || dirty[1] & /*$$scope*/ 33554432)) {
    					update_slot_base(
    						svg_slot,
    						svg_slot_template,
    						ctx,
    						/*$$scope*/ ctx[56],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[56])
    						: get_slot_changes(svg_slot_template, /*$$scope*/ ctx[56], dirty, get_svg_slot_changes),
    						get_svg_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			transition_in(if_block3);
    			transition_in(if_block4);
    			transition_in(svg_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			transition_out(if_block3);
    			transition_out(if_block4);
    			transition_out(svg_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(t2);
    			if (if_block3) if_block3.d(detaching);
    			if (detaching) detach_dev(t3);
    			if (if_block4) if_block4.d(detaching);
    			if (detaching) detach_dev(t4);
    			if (svg_slot) svg_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(186:6) <Svg pointerEvents={interactive}>",
    		ctx
    	});

    	return block;
    }

    // (153:2) <LayerCake      {padding}      x={xKey}      y={yKey}      z={zKey}      yDomain={$yDomain}      yScale={yScale == 'log' ? scaleSymlog() : scaleLinear()}      zScale={scaleOrdinal()}      {zDomain}      zRange={colors}      data={groupedData}      flatData={data}      custom={{        type: 'line',        mode,        idKey,        labelKey,        coords,        colorSelect,        colorHover,        colorHighlight,        animation,        duration,        groups_all: groups_all,        groups_selected: groups_selected,        step: step,      }}      let:width    >
    function create_default_slot_1(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*width*/ ctx[63] > 80 && create_if_block_2$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*width*/ ctx[63] > 80) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[2] & /*width*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_2$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(153:2) <LayerCake      {padding}      x={xKey}      y={yKey}      z={zKey}      yDomain={$yDomain}      yScale={yScale == 'log' ? scaleSymlog() : scaleLinear()}      zScale={scaleOrdinal()}      {zDomain}      zRange={colors}      data={groupedData}      flatData={data}      custom={{        type: 'line',        mode,        idKey,        labelKey,        coords,        colorSelect,        colorHover,        colorHighlight,        animation,        duration,        groups_all: groups_all,        groups_selected: groups_selected,        step: step,      }}      let:width    >",
    		ctx
    	});

    	return block;
    }

    // (222:0) {#if legend && zDomain}
    function create_if_block_1$6(ctx) {
    	let legend_1;
    	let current;

    	legend_1 = new Legend({
    			props: {
    				domain: /*zDomain*/ ctx[43],
    				colors: /*colors*/ ctx[27],
    				line: /*line*/ ctx[22],
    				markerWidth: /*lineWidth*/ ctx[28]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(legend_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(legend_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const legend_1_changes = {};
    			if (dirty[1] & /*zDomain*/ 4096) legend_1_changes.domain = /*zDomain*/ ctx[43];
    			if (dirty[0] & /*colors*/ 134217728) legend_1_changes.colors = /*colors*/ ctx[27];
    			if (dirty[0] & /*line*/ 4194304) legend_1_changes.line = /*line*/ ctx[22];
    			if (dirty[0] & /*lineWidth*/ 268435456) legend_1_changes.markerWidth = /*lineWidth*/ ctx[28];
    			legend_1.$set(legend_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(legend_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(legend_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(legend_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$6.name,
    		type: "if",
    		source: "(222:0) {#if legend && zDomain}",
    		ctx
    	});

    	return block;
    }

    // (225:0) {#if footer}
    function create_if_block$b(ctx) {
    	let footer_1;
    	let current;

    	footer_1 = new Footer({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(footer_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(footer_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const footer_1_changes = {};

    			if (dirty[0] & /*footer*/ 262144 | dirty[1] & /*$$scope*/ 33554432) {
    				footer_1_changes.$$scope = { dirty, ctx };
    			}

    			footer_1.$set(footer_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(footer_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(footer_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(footer_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$b.name,
    		type: "if",
    		source: "(225:0) {#if footer}",
    		ctx
    	});

    	return block;
    }

    // (226:2) <Footer>
    function create_default_slot(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*footer*/ ctx[18]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*footer*/ 262144) set_data_dev(t, /*footer*/ ctx[18]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(226:2) <Footer>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$m(ctx) {
    	let t0;
    	let t1;
    	let div;
    	let layercake;
    	let t2;
    	let t3;
    	let if_block2_anchor;
    	let current;
    	let if_block0 = /*title*/ ctx[17] && create_if_block_8(ctx);
    	const options_slot_template = /*#slots*/ ctx[51].options;
    	const options_slot = create_slot(options_slot_template, ctx, /*$$scope*/ ctx[56], get_options_slot_context);

    	layercake = new LayerCake({
    			props: {
    				padding: /*padding*/ ctx[26],
    				x: /*xKey*/ ctx[6],
    				y: /*yKey*/ ctx[7],
    				z: /*zKey*/ ctx[8],
    				yDomain: /*$yDomain*/ ctx[45],
    				yScale: /*yScale*/ ctx[11] == 'log'
    				? symlog$1()
    				: linear$2(),
    				zScale: ordinal(),
    				zDomain: /*zDomain*/ ctx[43],
    				zRange: /*colors*/ ctx[27],
    				data: /*groupedData*/ ctx[44],
    				flatData: /*data*/ ctx[2],
    				custom: {
    					type: 'line',
    					mode: /*mode*/ ctx[24],
    					idKey: /*idKey*/ ctx[9],
    					labelKey: /*labelKey*/ ctx[10],
    					coords: /*coords*/ ctx[46],
    					colorSelect: /*colorSelect*/ ctx[37],
    					colorHover: /*colorHover*/ ctx[35],
    					colorHighlight: /*colorHighlight*/ ctx[39],
    					animation: /*animation*/ ctx[4],
    					duration: /*duration*/ ctx[5],
    					groups_all: /*groups_all*/ ctx[40],
    					groups_selected: /*groups_selected*/ ctx[41],
    					step: /*step*/ ctx[42]
    				},
    				$$slots: {
    					default: [
    						create_default_slot_1,
    						({ width }) => ({ 63: width }),
    						({ width }) => [0, 0, width ? 2 : 0]
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let if_block1 = /*legend*/ ctx[19] && /*zDomain*/ ctx[43] && create_if_block_1$6(ctx);
    	let if_block2 = /*footer*/ ctx[18] && create_if_block$b(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (options_slot) options_slot.c();
    			t1 = space();
    			div = element("div");
    			create_component(layercake.$$.fragment);
    			t2 = space();
    			if (if_block1) if_block1.c();
    			t3 = space();
    			if (if_block2) if_block2.c();
    			if_block2_anchor = empty();
    			attr_dev(div, "class", "chart-container svelte-1wnx7p6");

    			set_style(div, "height", typeof /*height*/ ctx[3] == 'number'
    			? /*height*/ ctx[3] + 'px'
    			: /*height*/ ctx[3]);

    			add_location(div, file$l, 148, 0, 4370);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t0, anchor);

    			if (options_slot) {
    				options_slot.m(target, anchor);
    			}

    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    			mount_component(layercake, div, null);
    			insert_dev(target, t2, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t3, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, if_block2_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*title*/ ctx[17]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*title*/ 131072) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_8(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (options_slot) {
    				if (options_slot.p && (!current || dirty[1] & /*$$scope*/ 33554432)) {
    					update_slot_base(
    						options_slot,
    						options_slot_template,
    						ctx,
    						/*$$scope*/ ctx[56],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[56])
    						: get_slot_changes(options_slot_template, /*$$scope*/ ctx[56], dirty, get_options_slot_changes),
    						get_options_slot_context
    					);
    				}
    			}

    			const layercake_changes = {};
    			if (dirty[0] & /*padding*/ 67108864) layercake_changes.padding = /*padding*/ ctx[26];
    			if (dirty[0] & /*xKey*/ 64) layercake_changes.x = /*xKey*/ ctx[6];
    			if (dirty[0] & /*yKey*/ 128) layercake_changes.y = /*yKey*/ ctx[7];
    			if (dirty[0] & /*zKey*/ 256) layercake_changes.z = /*zKey*/ ctx[8];
    			if (dirty[1] & /*$yDomain*/ 16384) layercake_changes.yDomain = /*$yDomain*/ ctx[45];

    			if (dirty[0] & /*yScale*/ 2048) layercake_changes.yScale = /*yScale*/ ctx[11] == 'log'
    			? symlog$1()
    			: linear$2();

    			if (dirty[1] & /*zDomain*/ 4096) layercake_changes.zDomain = /*zDomain*/ ctx[43];
    			if (dirty[0] & /*colors*/ 134217728) layercake_changes.zRange = /*colors*/ ctx[27];
    			if (dirty[1] & /*groupedData*/ 8192) layercake_changes.data = /*groupedData*/ ctx[44];
    			if (dirty[0] & /*data*/ 4) layercake_changes.flatData = /*data*/ ctx[2];

    			if (dirty[0] & /*mode, idKey, labelKey, animation, duration*/ 16778800 | dirty[1] & /*colorSelect, colorHover, colorHighlight, groups_all, groups_selected, step*/ 3920) layercake_changes.custom = {
    				type: 'line',
    				mode: /*mode*/ ctx[24],
    				idKey: /*idKey*/ ctx[9],
    				labelKey: /*labelKey*/ ctx[10],
    				coords: /*coords*/ ctx[46],
    				colorSelect: /*colorSelect*/ ctx[37],
    				colorHover: /*colorHover*/ ctx[35],
    				colorHighlight: /*colorHighlight*/ ctx[39],
    				animation: /*animation*/ ctx[4],
    				duration: /*duration*/ ctx[5],
    				groups_all: /*groups_all*/ ctx[40],
    				groups_selected: /*groups_selected*/ ctx[41],
    				step: /*step*/ ctx[42]
    			};

    			if (dirty[0] & /*interactive, hovered, selected, labels, lineWidth, line, mode, areaOpacity, area, yTicks, yFormatTick, yAxis, xTicks, snapTicks, xPrefix, xAxis*/ 1945235459 | dirty[1] & /*$$scope, select, hover, highlighted, yPrefix, ySuffix, xSuffix*/ 33554607 | dirty[2] & /*width*/ 2) {
    				layercake_changes.$$scope = { dirty, ctx };
    			}

    			layercake.$set(layercake_changes);

    			if (!current || dirty[0] & /*height*/ 8) {
    				set_style(div, "height", typeof /*height*/ ctx[3] == 'number'
    				? /*height*/ ctx[3] + 'px'
    				: /*height*/ ctx[3]);
    			}

    			if (/*legend*/ ctx[19] && /*zDomain*/ ctx[43]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*legend*/ 524288 | dirty[1] & /*zDomain*/ 4096) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_1$6(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(t3.parentNode, t3);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*footer*/ ctx[18]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty[0] & /*footer*/ 262144) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block$b(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(if_block2_anchor.parentNode, if_block2_anchor);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(options_slot, local);
    			transition_in(layercake.$$.fragment, local);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(options_slot, local);
    			transition_out(layercake.$$.fragment, local);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (options_slot) options_slot.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    			destroy_component(layercake);
    			if (detaching) detach_dev(t2);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t3);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(if_block2_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$m($$self, $$props, $$invalidate) {
    	let zDomain;
    	let groupedData;
    	let $yDomain;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('LineChart', slots, ['options','back','svg','front']);
    	let { data } = $$props;
    	let { height = 250 } = $$props;
    	let { animation = true } = $$props;
    	let { duration = 800 } = $$props;
    	let { xKey = 'x' } = $$props;
    	let { yKey = 'y' } = $$props;
    	let { zKey = null } = $$props;
    	let { idKey = zKey } = $$props;
    	let { labelKey = idKey } = $$props;
    	let { yScale = 'linear' } = $$props;
    	let { yFormatTick = d => d } = $$props;
    	let { yMax = null } = $$props;
    	let { yMin = 0 } = $$props;
    	let { xAxis = true } = $$props;
    	let { yAxis = true } = $$props;
    	let { xTicks = 4 } = $$props;
    	let { yTicks = 4 } = $$props;
    	let { title = null } = $$props;
    	let { footer = null } = $$props;
    	let { legend = false } = $$props;
    	let { labels = false } = $$props;
    	let { snapTicks = true } = $$props;
    	let { line = true } = $$props;
    	let { area = true } = $$props;
    	let { mode = 'default' } = $$props;
    	let { areaOpacity = 1 } = $$props;
    	let { padding = { top: 0, bottom: 20, left: 35, right: 0 } } = $$props;
    	let { color = null } = $$props;

    	let { colors = color
    	? [color]
    	: [
    			'#206095',
    			'#A8BD3A',
    			'#003C57',
    			'#27A0CC',
    			'#118C7B',
    			'#F66068',
    			'#746CB1',
    			'#22D0B6',
    			'lightgrey'
    		] } = $$props;

    	let { lineWidth = 2.5 } = $$props;
    	let { interactive = true } = $$props;
    	let { xPrefix = '' } = $$props;
    	let { xSuffix = '' } = $$props;
    	let { yPrefix = '' } = $$props;
    	let { ySuffix = '' } = $$props;
    	let { hover = false } = $$props;
    	let { hovered = null } = $$props;
    	let { colorHover = 'orange' } = $$props;
    	let { select = false } = $$props;
    	let { selected = null } = $$props;
    	let { colorSelect = '#206095' } = $$props;
    	let { highlighted = [] } = $$props;
    	let { colorHighlight = '#206095' } = $$props;
    	let { groups_all } = $$props;
    	let { groups_selected } = $$props;
    	let { step } = $$props;
    	console.log(data);
    	const tweenOptions = { duration, easing: cubicInOut };
    	const coords = tweened(undefined, tweenOptions);
    	const distinct = (d, i, arr) => arr.indexOf(d) == i;

    	function getTotals(data, keys) {
    		let arr = [];

    		keys.forEach(key => {
    			let vals = data.filter(d => d[xKey] == key).map(d => d[yKey]);
    			let sum = vals.reduce((acc, curr) => acc + curr);
    			arr.push(sum);
    		});

    		return arr;
    	}

    	// # ============================================================================ #
    	// #   yDomain updates
    	// Functions to animate yDomain
    	const yDomSet = (data, mode, yKey, yMax) => yMax
    	? [yMin, yMax]
    	: mode == 'stacked' && yKey
    		? [
    				yMin,
    				Math.max(...getTotals(data, data.map(d => d[xKey]).filter(distinct)))
    			]
    		: [yMin, Math.max(...data.map(d => d[yKey]))];

    	function yDomUpdate(data, mode, yKey, yMax) {
    		let newYDom = yDomSet(data, mode, yKey, yMax);

    		if (newYDom[0] != yDom[0] || newYDom[1] != yDom[1]) {
    			yDomain.set(newYDom, { duration: animation ? duration : 0 });
    			yDom = newYDom;
    		}
    	}

    	let yDom = yDomSet(data, mode, yKey, yMax);
    	const yDomain = tweened(yDom, tweenOptions);
    	validate_store(yDomain, 'yDomain');
    	component_subscribe($$self, yDomain, value => $$invalidate(45, $yDomain = value));

    	const writable_props = [
    		'data',
    		'height',
    		'animation',
    		'duration',
    		'xKey',
    		'yKey',
    		'zKey',
    		'idKey',
    		'labelKey',
    		'yScale',
    		'yFormatTick',
    		'yMax',
    		'yMin',
    		'xAxis',
    		'yAxis',
    		'xTicks',
    		'yTicks',
    		'title',
    		'footer',
    		'legend',
    		'labels',
    		'snapTicks',
    		'line',
    		'area',
    		'mode',
    		'areaOpacity',
    		'padding',
    		'color',
    		'colors',
    		'lineWidth',
    		'interactive',
    		'xPrefix',
    		'xSuffix',
    		'yPrefix',
    		'ySuffix',
    		'hover',
    		'hovered',
    		'colorHover',
    		'select',
    		'selected',
    		'colorSelect',
    		'highlighted',
    		'colorHighlight',
    		'groups_all',
    		'groups_selected',
    		'step'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$3.warn(`<LineChart> was created with unknown prop '${key}'`);
    	});

    	function line_1_selected_binding(value) {
    		selected = value;
    		$$invalidate(1, selected);
    	}

    	function line_1_hovered_binding(value) {
    		hovered = value;
    		$$invalidate(0, hovered);
    	}

    	function hover_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function select_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('data' in $$props) $$invalidate(2, data = $$props.data);
    		if ('height' in $$props) $$invalidate(3, height = $$props.height);
    		if ('animation' in $$props) $$invalidate(4, animation = $$props.animation);
    		if ('duration' in $$props) $$invalidate(5, duration = $$props.duration);
    		if ('xKey' in $$props) $$invalidate(6, xKey = $$props.xKey);
    		if ('yKey' in $$props) $$invalidate(7, yKey = $$props.yKey);
    		if ('zKey' in $$props) $$invalidate(8, zKey = $$props.zKey);
    		if ('idKey' in $$props) $$invalidate(9, idKey = $$props.idKey);
    		if ('labelKey' in $$props) $$invalidate(10, labelKey = $$props.labelKey);
    		if ('yScale' in $$props) $$invalidate(11, yScale = $$props.yScale);
    		if ('yFormatTick' in $$props) $$invalidate(12, yFormatTick = $$props.yFormatTick);
    		if ('yMax' in $$props) $$invalidate(48, yMax = $$props.yMax);
    		if ('yMin' in $$props) $$invalidate(49, yMin = $$props.yMin);
    		if ('xAxis' in $$props) $$invalidate(13, xAxis = $$props.xAxis);
    		if ('yAxis' in $$props) $$invalidate(14, yAxis = $$props.yAxis);
    		if ('xTicks' in $$props) $$invalidate(15, xTicks = $$props.xTicks);
    		if ('yTicks' in $$props) $$invalidate(16, yTicks = $$props.yTicks);
    		if ('title' in $$props) $$invalidate(17, title = $$props.title);
    		if ('footer' in $$props) $$invalidate(18, footer = $$props.footer);
    		if ('legend' in $$props) $$invalidate(19, legend = $$props.legend);
    		if ('labels' in $$props) $$invalidate(20, labels = $$props.labels);
    		if ('snapTicks' in $$props) $$invalidate(21, snapTicks = $$props.snapTicks);
    		if ('line' in $$props) $$invalidate(22, line = $$props.line);
    		if ('area' in $$props) $$invalidate(23, area = $$props.area);
    		if ('mode' in $$props) $$invalidate(24, mode = $$props.mode);
    		if ('areaOpacity' in $$props) $$invalidate(25, areaOpacity = $$props.areaOpacity);
    		if ('padding' in $$props) $$invalidate(26, padding = $$props.padding);
    		if ('color' in $$props) $$invalidate(50, color = $$props.color);
    		if ('colors' in $$props) $$invalidate(27, colors = $$props.colors);
    		if ('lineWidth' in $$props) $$invalidate(28, lineWidth = $$props.lineWidth);
    		if ('interactive' in $$props) $$invalidate(29, interactive = $$props.interactive);
    		if ('xPrefix' in $$props) $$invalidate(30, xPrefix = $$props.xPrefix);
    		if ('xSuffix' in $$props) $$invalidate(31, xSuffix = $$props.xSuffix);
    		if ('yPrefix' in $$props) $$invalidate(32, yPrefix = $$props.yPrefix);
    		if ('ySuffix' in $$props) $$invalidate(33, ySuffix = $$props.ySuffix);
    		if ('hover' in $$props) $$invalidate(34, hover = $$props.hover);
    		if ('hovered' in $$props) $$invalidate(0, hovered = $$props.hovered);
    		if ('colorHover' in $$props) $$invalidate(35, colorHover = $$props.colorHover);
    		if ('select' in $$props) $$invalidate(36, select = $$props.select);
    		if ('selected' in $$props) $$invalidate(1, selected = $$props.selected);
    		if ('colorSelect' in $$props) $$invalidate(37, colorSelect = $$props.colorSelect);
    		if ('highlighted' in $$props) $$invalidate(38, highlighted = $$props.highlighted);
    		if ('colorHighlight' in $$props) $$invalidate(39, colorHighlight = $$props.colorHighlight);
    		if ('groups_all' in $$props) $$invalidate(40, groups_all = $$props.groups_all);
    		if ('groups_selected' in $$props) $$invalidate(41, groups_selected = $$props.groups_selected);
    		if ('step' in $$props) $$invalidate(42, step = $$props.step);
    		if ('$$scope' in $$props) $$invalidate(56, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		LayerCake,
    		Svg,
    		scaleOrdinal: ordinal,
    		scaleLinear: linear$2,
    		scaleSymlog: symlog$1,
    		tweened,
    		cubicInOut,
    		groupData,
    		stackData,
    		SetCoords,
    		Line,
    		Area,
    		AxisX,
    		AxisY,
    		Legend,
    		Title,
    		Footer,
    		Labels,
    		data,
    		height,
    		animation,
    		duration,
    		xKey,
    		yKey,
    		zKey,
    		idKey,
    		labelKey,
    		yScale,
    		yFormatTick,
    		yMax,
    		yMin,
    		xAxis,
    		yAxis,
    		xTicks,
    		yTicks,
    		title,
    		footer,
    		legend,
    		labels,
    		snapTicks,
    		line,
    		area,
    		mode,
    		areaOpacity,
    		padding,
    		color,
    		colors,
    		lineWidth,
    		interactive,
    		xPrefix,
    		xSuffix,
    		yPrefix,
    		ySuffix,
    		hover,
    		hovered,
    		colorHover,
    		select,
    		selected,
    		colorSelect,
    		highlighted,
    		colorHighlight,
    		groups_all,
    		groups_selected,
    		step,
    		tweenOptions,
    		coords,
    		distinct,
    		getTotals,
    		yDomSet,
    		yDomUpdate,
    		yDom,
    		yDomain,
    		zDomain,
    		groupedData,
    		$yDomain
    	});

    	$$self.$inject_state = $$props => {
    		if ('data' in $$props) $$invalidate(2, data = $$props.data);
    		if ('height' in $$props) $$invalidate(3, height = $$props.height);
    		if ('animation' in $$props) $$invalidate(4, animation = $$props.animation);
    		if ('duration' in $$props) $$invalidate(5, duration = $$props.duration);
    		if ('xKey' in $$props) $$invalidate(6, xKey = $$props.xKey);
    		if ('yKey' in $$props) $$invalidate(7, yKey = $$props.yKey);
    		if ('zKey' in $$props) $$invalidate(8, zKey = $$props.zKey);
    		if ('idKey' in $$props) $$invalidate(9, idKey = $$props.idKey);
    		if ('labelKey' in $$props) $$invalidate(10, labelKey = $$props.labelKey);
    		if ('yScale' in $$props) $$invalidate(11, yScale = $$props.yScale);
    		if ('yFormatTick' in $$props) $$invalidate(12, yFormatTick = $$props.yFormatTick);
    		if ('yMax' in $$props) $$invalidate(48, yMax = $$props.yMax);
    		if ('yMin' in $$props) $$invalidate(49, yMin = $$props.yMin);
    		if ('xAxis' in $$props) $$invalidate(13, xAxis = $$props.xAxis);
    		if ('yAxis' in $$props) $$invalidate(14, yAxis = $$props.yAxis);
    		if ('xTicks' in $$props) $$invalidate(15, xTicks = $$props.xTicks);
    		if ('yTicks' in $$props) $$invalidate(16, yTicks = $$props.yTicks);
    		if ('title' in $$props) $$invalidate(17, title = $$props.title);
    		if ('footer' in $$props) $$invalidate(18, footer = $$props.footer);
    		if ('legend' in $$props) $$invalidate(19, legend = $$props.legend);
    		if ('labels' in $$props) $$invalidate(20, labels = $$props.labels);
    		if ('snapTicks' in $$props) $$invalidate(21, snapTicks = $$props.snapTicks);
    		if ('line' in $$props) $$invalidate(22, line = $$props.line);
    		if ('area' in $$props) $$invalidate(23, area = $$props.area);
    		if ('mode' in $$props) $$invalidate(24, mode = $$props.mode);
    		if ('areaOpacity' in $$props) $$invalidate(25, areaOpacity = $$props.areaOpacity);
    		if ('padding' in $$props) $$invalidate(26, padding = $$props.padding);
    		if ('color' in $$props) $$invalidate(50, color = $$props.color);
    		if ('colors' in $$props) $$invalidate(27, colors = $$props.colors);
    		if ('lineWidth' in $$props) $$invalidate(28, lineWidth = $$props.lineWidth);
    		if ('interactive' in $$props) $$invalidate(29, interactive = $$props.interactive);
    		if ('xPrefix' in $$props) $$invalidate(30, xPrefix = $$props.xPrefix);
    		if ('xSuffix' in $$props) $$invalidate(31, xSuffix = $$props.xSuffix);
    		if ('yPrefix' in $$props) $$invalidate(32, yPrefix = $$props.yPrefix);
    		if ('ySuffix' in $$props) $$invalidate(33, ySuffix = $$props.ySuffix);
    		if ('hover' in $$props) $$invalidate(34, hover = $$props.hover);
    		if ('hovered' in $$props) $$invalidate(0, hovered = $$props.hovered);
    		if ('colorHover' in $$props) $$invalidate(35, colorHover = $$props.colorHover);
    		if ('select' in $$props) $$invalidate(36, select = $$props.select);
    		if ('selected' in $$props) $$invalidate(1, selected = $$props.selected);
    		if ('colorSelect' in $$props) $$invalidate(37, colorSelect = $$props.colorSelect);
    		if ('highlighted' in $$props) $$invalidate(38, highlighted = $$props.highlighted);
    		if ('colorHighlight' in $$props) $$invalidate(39, colorHighlight = $$props.colorHighlight);
    		if ('groups_all' in $$props) $$invalidate(40, groups_all = $$props.groups_all);
    		if ('groups_selected' in $$props) $$invalidate(41, groups_selected = $$props.groups_selected);
    		if ('step' in $$props) $$invalidate(42, step = $$props.step);
    		if ('yDom' in $$props) yDom = $$props.yDom;
    		if ('zDomain' in $$props) $$invalidate(43, zDomain = $$props.zDomain);
    		if ('groupedData' in $$props) $$invalidate(44, groupedData = $$props.groupedData);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*zKey, data*/ 260) {
    			// # ============================================================================ #
    			// #   zDomain updates
    			 $$invalidate(43, zDomain = zKey ? data.map(d => d.group).filter(distinct) : null);
    		}

    		if ($$self.$$.dirty[0] & /*mode, data, yKey, zKey*/ 16777604 | $$self.$$.dirty[1] & /*zDomain*/ 4096) {
    			// Create a data series for each zKey (group)
    			 $$invalidate(44, groupedData = mode == 'stacked'
    			? stackData(data, zDomain, yKey, zKey)
    			: groupData(data, zDomain, zKey));
    		}

    		if ($$self.$$.dirty[1] & /*step, groups_selected, groupedData*/ 11264) {
    			 {
    				console.log(` ******************* LineChart ${step}  `);
    				console.log(groups_selected);
    				console.log(groupedData);
    			}
    		}

    		if ($$self.$$.dirty[0] & /*data, mode, yKey*/ 16777348 | $$self.$$.dirty[1] & /*yMax*/ 131072) {
    			 yDomUpdate(data, mode, yKey, yMax);
    		}
    	};

    	return [
    		hovered,
    		selected,
    		data,
    		height,
    		animation,
    		duration,
    		xKey,
    		yKey,
    		zKey,
    		idKey,
    		labelKey,
    		yScale,
    		yFormatTick,
    		xAxis,
    		yAxis,
    		xTicks,
    		yTicks,
    		title,
    		footer,
    		legend,
    		labels,
    		snapTicks,
    		line,
    		area,
    		mode,
    		areaOpacity,
    		padding,
    		colors,
    		lineWidth,
    		interactive,
    		xPrefix,
    		xSuffix,
    		yPrefix,
    		ySuffix,
    		hover,
    		colorHover,
    		select,
    		colorSelect,
    		highlighted,
    		colorHighlight,
    		groups_all,
    		groups_selected,
    		step,
    		zDomain,
    		groupedData,
    		$yDomain,
    		coords,
    		yDomain,
    		yMax,
    		yMin,
    		color,
    		slots,
    		line_1_selected_binding,
    		line_1_hovered_binding,
    		hover_handler,
    		select_handler,
    		$$scope
    	];
    }

    class LineChart extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$m,
    			create_fragment$m,
    			safe_not_equal,
    			{
    				data: 2,
    				height: 3,
    				animation: 4,
    				duration: 5,
    				xKey: 6,
    				yKey: 7,
    				zKey: 8,
    				idKey: 9,
    				labelKey: 10,
    				yScale: 11,
    				yFormatTick: 12,
    				yMax: 48,
    				yMin: 49,
    				xAxis: 13,
    				yAxis: 14,
    				xTicks: 15,
    				yTicks: 16,
    				title: 17,
    				footer: 18,
    				legend: 19,
    				labels: 20,
    				snapTicks: 21,
    				line: 22,
    				area: 23,
    				mode: 24,
    				areaOpacity: 25,
    				padding: 26,
    				color: 50,
    				colors: 27,
    				lineWidth: 28,
    				interactive: 29,
    				xPrefix: 30,
    				xSuffix: 31,
    				yPrefix: 32,
    				ySuffix: 33,
    				hover: 34,
    				hovered: 0,
    				colorHover: 35,
    				select: 36,
    				selected: 1,
    				colorSelect: 37,
    				highlighted: 38,
    				colorHighlight: 39,
    				groups_all: 40,
    				groups_selected: 41,
    				step: 42
    			},
    			null,
    			[-1, -1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LineChart",
    			options,
    			id: create_fragment$m.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[2] === undefined && !('data' in props)) {
    			console_1$3.warn("<LineChart> was created without expected prop 'data'");
    		}

    		if (/*groups_all*/ ctx[40] === undefined && !('groups_all' in props)) {
    			console_1$3.warn("<LineChart> was created without expected prop 'groups_all'");
    		}

    		if (/*groups_selected*/ ctx[41] === undefined && !('groups_selected' in props)) {
    			console_1$3.warn("<LineChart> was created without expected prop 'groups_selected'");
    		}

    		if (/*step*/ ctx[42] === undefined && !('step' in props)) {
    			console_1$3.warn("<LineChart> was created without expected prop 'step'");
    		}
    	}

    	get data() {
    		return this.$$.ctx[2];
    	}

    	set data(data) {
    		this.$$set({ data });
    		flush();
    	}

    	get height() {
    		return this.$$.ctx[3];
    	}

    	set height(height) {
    		this.$$set({ height });
    		flush();
    	}

    	get animation() {
    		return this.$$.ctx[4];
    	}

    	set animation(animation) {
    		this.$$set({ animation });
    		flush();
    	}

    	get duration() {
    		return this.$$.ctx[5];
    	}

    	set duration(duration) {
    		this.$$set({ duration });
    		flush();
    	}

    	get xKey() {
    		return this.$$.ctx[6];
    	}

    	set xKey(xKey) {
    		this.$$set({ xKey });
    		flush();
    	}

    	get yKey() {
    		return this.$$.ctx[7];
    	}

    	set yKey(yKey) {
    		this.$$set({ yKey });
    		flush();
    	}

    	get zKey() {
    		return this.$$.ctx[8];
    	}

    	set zKey(zKey) {
    		this.$$set({ zKey });
    		flush();
    	}

    	get idKey() {
    		return this.$$.ctx[9];
    	}

    	set idKey(idKey) {
    		this.$$set({ idKey });
    		flush();
    	}

    	get labelKey() {
    		return this.$$.ctx[10];
    	}

    	set labelKey(labelKey) {
    		this.$$set({ labelKey });
    		flush();
    	}

    	get yScale() {
    		return this.$$.ctx[11];
    	}

    	set yScale(yScale) {
    		this.$$set({ yScale });
    		flush();
    	}

    	get yFormatTick() {
    		return this.$$.ctx[12];
    	}

    	set yFormatTick(yFormatTick) {
    		this.$$set({ yFormatTick });
    		flush();
    	}

    	get yMax() {
    		return this.$$.ctx[48];
    	}

    	set yMax(yMax) {
    		this.$$set({ yMax });
    		flush();
    	}

    	get yMin() {
    		return this.$$.ctx[49];
    	}

    	set yMin(yMin) {
    		this.$$set({ yMin });
    		flush();
    	}

    	get xAxis() {
    		return this.$$.ctx[13];
    	}

    	set xAxis(xAxis) {
    		this.$$set({ xAxis });
    		flush();
    	}

    	get yAxis() {
    		return this.$$.ctx[14];
    	}

    	set yAxis(yAxis) {
    		this.$$set({ yAxis });
    		flush();
    	}

    	get xTicks() {
    		return this.$$.ctx[15];
    	}

    	set xTicks(xTicks) {
    		this.$$set({ xTicks });
    		flush();
    	}

    	get yTicks() {
    		return this.$$.ctx[16];
    	}

    	set yTicks(yTicks) {
    		this.$$set({ yTicks });
    		flush();
    	}

    	get title() {
    		return this.$$.ctx[17];
    	}

    	set title(title) {
    		this.$$set({ title });
    		flush();
    	}

    	get footer() {
    		return this.$$.ctx[18];
    	}

    	set footer(footer) {
    		this.$$set({ footer });
    		flush();
    	}

    	get legend() {
    		return this.$$.ctx[19];
    	}

    	set legend(legend) {
    		this.$$set({ legend });
    		flush();
    	}

    	get labels() {
    		return this.$$.ctx[20];
    	}

    	set labels(labels) {
    		this.$$set({ labels });
    		flush();
    	}

    	get snapTicks() {
    		return this.$$.ctx[21];
    	}

    	set snapTicks(snapTicks) {
    		this.$$set({ snapTicks });
    		flush();
    	}

    	get line() {
    		return this.$$.ctx[22];
    	}

    	set line(line) {
    		this.$$set({ line });
    		flush();
    	}

    	get area() {
    		return this.$$.ctx[23];
    	}

    	set area(area) {
    		this.$$set({ area });
    		flush();
    	}

    	get mode() {
    		return this.$$.ctx[24];
    	}

    	set mode(mode) {
    		this.$$set({ mode });
    		flush();
    	}

    	get areaOpacity() {
    		return this.$$.ctx[25];
    	}

    	set areaOpacity(areaOpacity) {
    		this.$$set({ areaOpacity });
    		flush();
    	}

    	get padding() {
    		return this.$$.ctx[26];
    	}

    	set padding(padding) {
    		this.$$set({ padding });
    		flush();
    	}

    	get color() {
    		return this.$$.ctx[50];
    	}

    	set color(color) {
    		this.$$set({ color });
    		flush();
    	}

    	get colors() {
    		return this.$$.ctx[27];
    	}

    	set colors(colors) {
    		this.$$set({ colors });
    		flush();
    	}

    	get lineWidth() {
    		return this.$$.ctx[28];
    	}

    	set lineWidth(lineWidth) {
    		this.$$set({ lineWidth });
    		flush();
    	}

    	get interactive() {
    		return this.$$.ctx[29];
    	}

    	set interactive(interactive) {
    		this.$$set({ interactive });
    		flush();
    	}

    	get xPrefix() {
    		return this.$$.ctx[30];
    	}

    	set xPrefix(xPrefix) {
    		this.$$set({ xPrefix });
    		flush();
    	}

    	get xSuffix() {
    		return this.$$.ctx[31];
    	}

    	set xSuffix(xSuffix) {
    		this.$$set({ xSuffix });
    		flush();
    	}

    	get yPrefix() {
    		return this.$$.ctx[32];
    	}

    	set yPrefix(yPrefix) {
    		this.$$set({ yPrefix });
    		flush();
    	}

    	get ySuffix() {
    		return this.$$.ctx[33];
    	}

    	set ySuffix(ySuffix) {
    		this.$$set({ ySuffix });
    		flush();
    	}

    	get hover() {
    		return this.$$.ctx[34];
    	}

    	set hover(hover) {
    		this.$$set({ hover });
    		flush();
    	}

    	get hovered() {
    		return this.$$.ctx[0];
    	}

    	set hovered(hovered) {
    		this.$$set({ hovered });
    		flush();
    	}

    	get colorHover() {
    		return this.$$.ctx[35];
    	}

    	set colorHover(colorHover) {
    		this.$$set({ colorHover });
    		flush();
    	}

    	get select() {
    		return this.$$.ctx[36];
    	}

    	set select(select) {
    		this.$$set({ select });
    		flush();
    	}

    	get selected() {
    		return this.$$.ctx[1];
    	}

    	set selected(selected) {
    		this.$$set({ selected });
    		flush();
    	}

    	get colorSelect() {
    		return this.$$.ctx[37];
    	}

    	set colorSelect(colorSelect) {
    		this.$$set({ colorSelect });
    		flush();
    	}

    	get highlighted() {
    		return this.$$.ctx[38];
    	}

    	set highlighted(highlighted) {
    		this.$$set({ highlighted });
    		flush();
    	}

    	get colorHighlight() {
    		return this.$$.ctx[39];
    	}

    	set colorHighlight(colorHighlight) {
    		this.$$set({ colorHighlight });
    		flush();
    	}

    	get groups_all() {
    		return this.$$.ctx[40];
    	}

    	set groups_all(groups_all) {
    		this.$$set({ groups_all });
    		flush();
    	}

    	get groups_selected() {
    		return this.$$.ctx[41];
    	}

    	set groups_selected(groups_selected) {
    		this.$$set({ groups_selected });
    		flush();
    	}

    	get step() {
    		return this.$$.ctx[42];
    	}

    	set step(step) {
    		this.$$set({ step });
    		flush();
    	}
    }

    /* src\App.svelte generated by Svelte v3.44.1 */

    const { Object: Object_1$1 } = globals;
    const file$m = "src\\App.svelte";

    // (210:10) {#if data && id && yMin >= 0}
    function create_if_block$c(ctx) {
    	let linechart;
    	let current;

    	linechart = new LineChart({
    			props: {
    				data: /*data*/ ctx[2],
    				height: 500,
    				xKey: "year",
    				area: false,
    				yKey: "value",
    				groups_all: /*groups_all*/ ctx[6],
    				groups_selected: /*groups_selected*/ ctx[4],
    				step: /*step*/ ctx[1],
    				yMin: /*yMin*/ ctx[3],
    				yMax: 85,
    				areaOpacity: 0.3,
    				animation: /*animation*/ ctx[5],
    				zKey: "group"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(linechart.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(linechart, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const linechart_changes = {};
    			if (dirty & /*data*/ 4) linechart_changes.data = /*data*/ ctx[2];
    			if (dirty & /*groups_selected*/ 16) linechart_changes.groups_selected = /*groups_selected*/ ctx[4];
    			if (dirty & /*step*/ 2) linechart_changes.step = /*step*/ ctx[1];
    			if (dirty & /*yMin*/ 8) linechart_changes.yMin = /*yMin*/ ctx[3];
    			linechart.$set(linechart_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(linechart.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(linechart.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(linechart, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$c.name,
    		type: "if",
    		source: "(210:10) {#if data && id && yMin >= 0}",
    		ctx
    	});

    	return block;
    }

    // (206:2) 
    function create_background_slot(ctx) {
    	let div2;
    	let figure;
    	let div1;
    	let div0;
    	let current;
    	let if_block = /*data*/ ctx[2] && /*id*/ ctx[0] && /*yMin*/ ctx[3] >= 0 && create_if_block$c(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			figure = element("figure");
    			div1 = element("div");
    			div0 = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div0, "class", "chart svelte-11mmfbg");
    			add_location(div0, file$m, 208, 8, 6706);
    			attr_dev(div1, "class", "col-wide height-full");
    			add_location(div1, file$m, 207, 6, 6662);
    			add_location(figure, file$m, 206, 4, 6646);
    			attr_dev(div2, "slot", "background");
    			add_location(div2, file$m, 205, 2, 6617);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, figure);
    			append_dev(figure, div1);
    			append_dev(div1, div0);
    			if (if_block) if_block.m(div0, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*data*/ ctx[2] && /*id*/ ctx[0] && /*yMin*/ ctx[3] >= 0) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*data, id, yMin*/ 13) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$c(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div0, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_background_slot.name,
    		type: "slot",
    		source: "(206:2) ",
    		ctx
    	});

    	return block;
    }

    // (232:2) 
    function create_foreground_slot(ctx) {
    	let div4;
    	let section0;
    	let div0;
    	let p0;
    	let t0;
    	let strong0;
    	let t2;
    	let t3;
    	let section1;
    	let div1;
    	let p1;
    	let t4;
    	let strong1;
    	let t6;
    	let t7;
    	let section2;
    	let div2;
    	let p2;
    	let t8;
    	let strong2;
    	let t10;
    	let t11;
    	let section3;
    	let div3;
    	let p3;
    	let t12;
    	let strong3;
    	let t14;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			section0 = element("section");
    			div0 = element("div");
    			p0 = element("p");
    			t0 = text("Trend of the cost of ");
    			strong0 = element("strong");
    			strong0.textContent = "some fruits";
    			t2 = text(" over time.");
    			t3 = space();
    			section1 = element("section");
    			div1 = element("div");
    			p1 = element("p");
    			t4 = text("Let ");
    			strong1 = element("strong");
    			strong1.textContent = "zoom in on y-axis";
    			t6 = text(" range of interest to better visualize\r\n          the data.");
    			t7 = space();
    			section2 = element("section");
    			div2 = element("div");
    			p2 = element("p");
    			t8 = text("We can ");
    			strong2 = element("strong");
    			strong2.textContent = "add data";
    			t10 = text(" to introduce a new group.");
    			t11 = space();
    			section3 = element("section");
    			div3 = element("div");
    			p3 = element("p");
    			t12 = text("We can ");
    			strong3 = element("strong");
    			strong3.textContent = "remove data";
    			t14 = text(" to emphasize a narrative.");
    			add_location(strong0, file$m, 235, 31, 7369);
    			add_location(p0, file$m, 234, 8, 7333);
    			attr_dev(div0, "class", "col-medium");
    			add_location(div0, file$m, 233, 6, 7299);
    			attr_dev(section0, "data-id", "chart01");
    			add_location(section0, file$m, 232, 4, 7264);
    			add_location(strong1, file$m, 242, 14, 7546);
    			add_location(p1, file$m, 241, 8, 7527);
    			attr_dev(div1, "class", "col-medium");
    			add_location(div1, file$m, 240, 6, 7493);
    			attr_dev(section1, "data-id", "chart02");
    			add_location(section1, file$m, 239, 4, 7458);
    			add_location(strong2, file$m, 250, 17, 7780);
    			add_location(p2, file$m, 249, 8, 7758);
    			attr_dev(div2, "class", "col-medium");
    			add_location(div2, file$m, 248, 6, 7724);
    			attr_dev(section2, "data-id", "chart03");
    			add_location(section2, file$m, 247, 4, 7689);
    			add_location(strong3, file$m, 257, 17, 7972);
    			add_location(p3, file$m, 256, 8, 7950);
    			attr_dev(div3, "class", "col-medium");
    			add_location(div3, file$m, 255, 6, 7916);
    			attr_dev(section3, "data-id", "chart04");
    			add_location(section3, file$m, 254, 4, 7881);
    			attr_dev(div4, "slot", "foreground");
    			add_location(div4, file$m, 231, 2, 7235);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, section0);
    			append_dev(section0, div0);
    			append_dev(div0, p0);
    			append_dev(p0, t0);
    			append_dev(p0, strong0);
    			append_dev(p0, t2);
    			append_dev(div4, t3);
    			append_dev(div4, section1);
    			append_dev(section1, div1);
    			append_dev(div1, p1);
    			append_dev(p1, t4);
    			append_dev(p1, strong1);
    			append_dev(p1, t6);
    			append_dev(div4, t7);
    			append_dev(div4, section2);
    			append_dev(section2, div2);
    			append_dev(div2, p2);
    			append_dev(p2, t8);
    			append_dev(p2, strong2);
    			append_dev(p2, t10);
    			append_dev(div4, t11);
    			append_dev(div4, section3);
    			append_dev(section3, div3);
    			append_dev(div3, p3);
    			append_dev(p3, t12);
    			append_dev(p3, strong3);
    			append_dev(p3, t14);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_foreground_slot.name,
    		type: "slot",
    		source: "(232:2) ",
    		ctx
    	});

    	return block;
    }

    // (272:0) <Section>
    function create_default_slot$1(ctx) {
    	let h2;
    	let t1;
    	let p;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Conclusions";
    			t1 = space();
    			p = element("p");
    			p.textContent = "Epsom Lorem ipsum dolor sit amet consectetur adipisicing elit. A magni\r\n    ducimus amet repellendus cupiditate? Ad optio saepe ducimus. At eveniet ad\r\n    delectus enim voluptatibus. Quaerat eligendi eaque corrupti possimus\r\n    molestiae?";
    			add_location(h2, file$m, 272, 2, 8240);
    			add_location(p, file$m, 273, 2, 8264);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(272:0) <Section>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$n(ctx) {
    	let divider0;
    	let t0;
    	let scroller;
    	let updating_id;
    	let t1;
    	let divider1;
    	let t2;
    	let section;
    	let t3;
    	let uhcfooter;
    	let t4;
    	let div;
    	let t5;
    	let t6;
    	let current;
    	divider0 = new Divider({ $$inline: true });

    	function scroller_id_binding(value) {
    		/*scroller_id_binding*/ ctx[7](value);
    	}

    	let scroller_props = {
    		threshold,
    		splitscreen: true,
    		$$slots: {
    			foreground: [create_foreground_slot],
    			background: [create_background_slot]
    		},
    		$$scope: { ctx }
    	};

    	if (/*id*/ ctx[0]['chart'] !== void 0) {
    		scroller_props.id = /*id*/ ctx[0]['chart'];
    	}

    	scroller = new Scroller({ props: scroller_props, $$inline: true });
    	binding_callbacks.push(() => bind(scroller, 'id', scroller_id_binding));
    	divider1 = new Divider({ $$inline: true });

    	section = new Section({
    			props: {
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	uhcfooter = new UHCFooter({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(divider0.$$.fragment);
    			t0 = space();
    			create_component(scroller.$$.fragment);
    			t1 = space();
    			create_component(divider1.$$.fragment);
    			t2 = space();
    			create_component(section.$$.fragment);
    			t3 = space();
    			create_component(uhcfooter.$$.fragment);
    			t4 = space();
    			div = element("div");
    			t5 = text("step: ");
    			t6 = text(/*step*/ ctx[1]);
    			attr_dev(div, "class", "stickDev svelte-11mmfbg");
    			add_location(div, file$m, 287, 0, 8663);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(divider0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(scroller, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(divider1, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(section, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(uhcfooter, target, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, t5);
    			append_dev(div, t6);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const scroller_changes = {};

    			if (dirty & /*$$scope, data, groups_selected, step, yMin, id*/ 1048607) {
    				scroller_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_id && dirty & /*id*/ 1) {
    				updating_id = true;
    				scroller_changes.id = /*id*/ ctx[0]['chart'];
    				add_flush_callback(() => updating_id = false);
    			}

    			scroller.$set(scroller_changes);
    			const section_changes = {};

    			if (dirty & /*$$scope*/ 1048576) {
    				section_changes.$$scope = { dirty, ctx };
    			}

    			section.$set(section_changes);
    			if (!current || dirty & /*step*/ 2) set_data_dev(t6, /*step*/ ctx[1]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(divider0.$$.fragment, local);
    			transition_in(scroller.$$.fragment, local);
    			transition_in(divider1.$$.fragment, local);
    			transition_in(section.$$.fragment, local);
    			transition_in(uhcfooter.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(divider0.$$.fragment, local);
    			transition_out(scroller.$$.fragment, local);
    			transition_out(divider1.$$.fragment, local);
    			transition_out(section.$$.fragment, local);
    			transition_out(uhcfooter.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(divider0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(scroller, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(divider1, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(section, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(uhcfooter, detaching);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$n.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const threshold = 0.65;

    function instance$n($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let theme = 'light';
    	setContext('theme', theme);
    	setColors(themes, theme);

    	//// State
    	let animation = getMotion(); // Set animation preference depending on browser preference

    	let hover = true;
    	let hovered = null;
    	let hoveredScatter = null;
    	let select = true;
    	let selected = null;
    	let selectedScatter = null;
    	let id = {}; // Object to hold visible section IDs of Scroller components
    	let idPrev = {}; // Object to keep track of previous IDs, to compare for changes

    	onMount(() => {
    		idPrev = { ...id };
    	});

    	// Scroll Updater
    	function runActions(codes = []) {
    		//// Code to run Scroller actions when new caption IDs come into view
    		codes.forEach(code => {
    			if (id[code] != idPrev[code]) {
    				// if caption id changes then run then run following code to update chart
    				// console.log(
    				//   ' -----------------------------Action Update -----------------------------'
    				// );
    				// console.log(id[code]);
    				// console.log(idPrev[code]);
    				// console.log(actions);
    				// console.log(actions[code]);
    				// console.log(actions[code][id[code]]);
    				if (actions[code][id[code]]) {
    					// console.log('within');
    					actions[code][id[code]]();
    				}

    				idPrev[code] = id[code];
    				$$invalidate(1, step = id[code]);
    			}
    		});
    	}

    	// # ============================================================================ #
    	// 5. Project Configs
    	// THese will change across projects
    	// # ============================================================================ #
    	//   5.1 Scrolly actions *********
    	let step = 'chart01';

    	let data; // initializes async in 5.5

    	// let yKey = 'apples';
    	let yMin = 0;

    	// In this fake data. flowers = 'philly' and apples = 'us average'
    	let groups_all = ['apples', 'cherries', 'dates', 'flowers'];

    	let groups_w_abnormal = ['apples', 'cherries', 'flowers'];
    	let groups_normal = ['apples', 'cherries', 'dates'];
    	let groups_selected = groups_normal;

    	let actions = {
    		chart: {
    			chart01: () => {
    				$$invalidate(2, data);
    				$$invalidate(3, yMin = 0);
    				$$invalidate(4, groups_selected = groups_normal);
    				$$invalidate(1, step = 'chart01');
    			},
    			chart02: () => {
    				$$invalidate(2, data);
    				$$invalidate(3, yMin = 65);
    				$$invalidate(4, groups_selected = groups_normal);
    				$$invalidate(1, step = 'chart02');
    			},
    			chart03: () => {
    				$$invalidate(2, data);
    				$$invalidate(3, yMin = 65);
    				$$invalidate(4, groups_selected = groups_all);
    				$$invalidate(1, step = 'chart03');
    			},
    			chart04: () => {
    				$$invalidate(2, data);
    				$$invalidate(3, yMin = 65);
    				$$invalidate(4, groups_selected = ['apples', 'flowers']);
    				$$invalidate(1, step = 'chart04');
    			}
    		}
    	};

    	// # ============================================================================ #
    	//   5.4 State
    	// # ============================================================================ #
    	//   5.5 Initialisation code (get data)
    	// getData(`./data/data_line_wide.csv`).then((arr) => {
    	// getData(`./data/data_le.csv`).then((arr) => {
    	//   console.log('flat data');
    	//   console.log(arr);
    	// });
    	getData(`./data/data_le.csv`).then(arr => {
    		$$invalidate(2, data = arr);
    	});

    	const writable_props = [];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function scroller_id_binding(value) {
    		if ($$self.$$.not_equal(id['chart'], value)) {
    			id['chart'] = value;
    			$$invalidate(0, id);
    		}
    	}

    	$$self.$capture_state = () => ({
    		setContext,
    		onMount,
    		getMotion,
    		themes,
    		UHCHeader,
    		UHCFooter,
    		Header,
    		Section,
    		Media,
    		Scroller,
    		Filler,
    		Divider,
    		Toggle,
    		Arrow,
    		getData,
    		setColors,
    		getBreaks,
    		getColor,
    		colors,
    		LineChart,
    		theme,
    		threshold,
    		animation,
    		hover,
    		hovered,
    		hoveredScatter,
    		select,
    		selected,
    		selectedScatter,
    		id,
    		idPrev,
    		runActions,
    		step,
    		data,
    		yMin,
    		groups_all,
    		groups_w_abnormal,
    		groups_normal,
    		groups_selected,
    		actions
    	});

    	$$self.$inject_state = $$props => {
    		if ('theme' in $$props) theme = $$props.theme;
    		if ('animation' in $$props) $$invalidate(5, animation = $$props.animation);
    		if ('hover' in $$props) hover = $$props.hover;
    		if ('hovered' in $$props) hovered = $$props.hovered;
    		if ('hoveredScatter' in $$props) hoveredScatter = $$props.hoveredScatter;
    		if ('select' in $$props) select = $$props.select;
    		if ('selected' in $$props) selected = $$props.selected;
    		if ('selectedScatter' in $$props) selectedScatter = $$props.selectedScatter;
    		if ('id' in $$props) $$invalidate(0, id = $$props.id);
    		if ('idPrev' in $$props) idPrev = $$props.idPrev;
    		if ('step' in $$props) $$invalidate(1, step = $$props.step);
    		if ('data' in $$props) $$invalidate(2, data = $$props.data);
    		if ('yMin' in $$props) $$invalidate(3, yMin = $$props.yMin);
    		if ('groups_all' in $$props) $$invalidate(6, groups_all = $$props.groups_all);
    		if ('groups_w_abnormal' in $$props) groups_w_abnormal = $$props.groups_w_abnormal;
    		if ('groups_normal' in $$props) groups_normal = $$props.groups_normal;
    		if ('groups_selected' in $$props) $$invalidate(4, groups_selected = $$props.groups_selected);
    		if ('actions' in $$props) $$invalidate(19, actions = $$props.actions);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*id*/ 1) {
    			 {
    				// Run above code when 'id' object changes
    				if (id) {
    					runActions(Object.keys(actions));
    				}
    			}
    		}
    	};

    	return [
    		id,
    		step,
    		data,
    		yMin,
    		groups_selected,
    		animation,
    		groups_all,
    		scroller_id_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$n, create_fragment$n, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$n.name
    		});
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
