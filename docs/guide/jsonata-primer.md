# JSONata primer

This is a _simple introduction_ highlighting the _key aspects_ of this language. Full details can be found at the online [JSONata documentation](https://docs.jsonata.org/overview)

**JSONata** code can be written as either a _single line expression_, or as multiple line expressions in a _code block_ `( )`.
Expressions are evaluated against a \_JSON object. In Node-RED this object is the node input message.

A single line expression is evaluated left to right _by operator_, and the result returned is the final evaluation.

- Everything in JSONata is an _expression_ and will be evaluated, returning the result
- Literals are evaluated as themselves, but must be valid JSON (number, string, Boolean, null, array or object)
- Object keys (fields) are evaluated as the key value, where found, thus `payload` will return the value contained in `msg.payload`
- The primary use of JSONata is to evaluate a JSON _path_, such as `msg.payload.foo.bar`
- Path operators are evaluated in a line expression by being applied to the top level message
  - `.` is the mapping (iteration) operator
  - `[ ]` is the filter (selection) operator
  - `{ }` is the reduce (aggregation) operator
  - `^( )` is the sorting (ordering) operator

**Context:**
At the start of a line expression, the _context_ is the entire top level message. Each path operator takes input from the current context, with the final result of each operation passed as output context to the next operator. Available context therefore changes as the evaluation proceeds. The current context at a specific point can be referred to using `$`. An additional operator `$$` can be used to refer to the top level context at any point, and `%` can be used to refer to the parent context (back one level) but only where this is possible to determine.

## The mapping (iteration) operator `.`

Syntax can be considered as `<sequence-list> . <expression>`.

The current _input-context_ on the left hand side of the operator is parsed as a _sequence_ or ordered list of items (for an array this is a list of the array elements, for an object or for a primitive this is usually a singleton list). Each item in this list is taken in sequence as the _evaluation-context_, and evaluated by the expression formed from the right hand side of the operator. The _result sequence_ is then collated into an output array (from an input list) or returned as a singleton (from an input singleton, or where the input sequence reduces to a singleton).

As an example, `$type(payload)` returns the type of the message payload, however `payload.$type($)` returns an array of the type of each _element_ within payload. For an array of numbers, this would be `["number", "number", "number"]`. The right hand side, `$type()` is a JSONata function requiring a parameter. For many functions one or more parameters are optional, and where omitted they take the current (evaluation) context `$` instead. In this case, the parameter is not optional, hence the use of `$` for the immediate context (each array element in turn).

**Index operator `#`:**
Applied with the mapping operator, the `#` _index_ operator can be used to capture the iteration index value for use later in the expression. The operator must be followed by a variable, for example `$i`, and this variable is made available for the remaining line expression. If `payload` is an array of three items, then `payload#$i.($i+2)` would return `[2, 3, 4]`. The use of `()` here is required since JSONata is left-associative and the parentheses are required to force the correct order of evaluation.

**Wildcards and array flattening:**
Within a path expression, `*` can be used to select all fields in an object, and `**` is a descendant wildcard for any depth of nesting. Thus `payload.**.time` would return an array of the values of all nested _time_ keys.

The path expression may generate an array of arrays for the evaluation sequence list. In this case, the list will always first be flattened to just one array. This flattening also occurs for output when the result is an arrays of arrays.

If payload is an array of objects then `payload.$keys()` returns an array, listing the keys names for each array object. For an array of nested objects, `payload.**.$keys()` returns a flattened array of all keys. To remove duplicates, the `$distinct()` function can be used, thus `$distinct(payload.**.$keys())` returns an array of every key in message payload to any depth.

## The filter (selection) operator `[ ]`

The `[ ]` operator has several applications.

- If the operator encloses an _integer_, this acts as **array index addressing**, where `payload[0]` returns the first item in the array, `[-1]` the last item. Note that the index can be an integer, or any number expression that returns or rounds down to an integer.
- If the operator encloses an _array of integers_, these act as a **selection list**, thus `payload[0, -1]` returns the first and last items from payload array.
- Otherwise, where the operator encloses a _predicate expression_, this will map over the current context as a list, **filtering** only the list items where the predicate evaluates as true. For example `payload[time<"12:00"]` where `time` is a key value within `payload` object.
- For the special **range operator** `[a..b]`, such as `[0..3]` this syntax generates an array of integers between the two given integer values. Note that, as in all cases in JSONata, the defining integer values can be either literals, or expressions that evaluate to an integer. To generate an array of integers to be used as a filter requires `[[a..b]]`.
- Lastly, this operator acts as an **array constructor**. `["one", "two", "three"]` is an array. The simple form `[]` may also be used at any point in a line expression to force singleton output to an array, as in `payload.data[]`.

JSONata does not inherently regard singleton values as fundamentally different to arrays. Although a singleton is a value without enclosing structure, path expressions that require an array input can accept a singleton, which is treated as an array of one item. In some situations, particularly with path input or output list flattening, it may be necessary to add an additional `[]` to the expression to ensure correct evaluation, and where an array of arrays is required in the result.

**No result means _nothing_ is returned:**
One of the more unusual aspects of JSONata is the behaviour when an expression evaluates to _no discernible result_. Simply put, JSONata will neither return a value, nor `null` nor an error message where there is no result from an expression. Mistyping `paylaod` or requesting an array index `payload[100]` for an array of only 25 items will return **nothing**. This can make writing, testing and debugging JSONata code challenging, but it eliminates the need to code for exception conditions - declare what you want, and nothing else will be returned.

The filter operator binds more strongly than the mapping operator. This means that `payload.array[0]` is returned as an array of the first items in each `payload.array` and not the first item in the `payload.array` array result. Use `(payload.array)[0]` to force evaluation in a different order.

## The reduce (aggregation) operator `{ }`

This operator can only be used once in an expression line, and should ideally be at the very end.
Note that `{ }` is a valid empty object, and `{"key": "value"}` is a one-field object as expected. Both the key as well as the value can be any expression, thus`{last_updated: payload.state}` will generate a valid object as long as `last_updated` results in a string value. Naturally values may be an valid JSON type, including objects and arrays.

It is worth noting that in a key-value pair where the value is an expression that returns nothing, the key-value pair will not be returned in the result.

Thus `{"key": "value", "result": [1, 2][4]}` will just return `{"key": "value"}`

## The order-by (sort) operator `^( )`

Applies to arrays, and will sort the array by one or more expressions, where the expression results in either a string or an number. Sorting is ascending `<` by default, but can be modified to descending `>`. Where `payload` is an array of objects, then `payload^(>field, second)` will sort the array, by the `field` value, in descending order, and for equal values, additionally by the `second` field in ascending order. To sort an array of primitives such as strings, use the context variable `$`. If `payload` is an object, `$keys(payload)^($)` returns an array of the object keys sorted into alphabetic order.

## Other Operators

JSONata is built on JavaScript, so much of the syntax and basic functions will be familiar. The usual mathematical operators apply.

Comparison operators are as expected, and also the `in` inclusion operator where `"b" in ["a", "b", "c"]` returns `true`.

Boolean operators are the usual `and` and `or`, but _not_ is provided as a function `$not()`.

String concatenation operator is `&`, which provides the only situation where type is cast. Numbers, Boolean, arrays and objects are all stringified as required. Hence `payload & ""` will turn an object to a stringified equivalent.

Conditional testing is a ternary operator, syntax as
`<test expression> ? <true expression> : <false expression>` which returns the result of either the true or false expression.
False expression is optional, and if omitted a false test expression result will return nothing. Nested conditionals evaluate as expected although the use of parentheses can help visual clarity or to change order.

## Variables

JSONata permits the use of variables, although some care needs to be exercised in their use.
Variables are named as `$name` and assigned using `$name:= <expression>`. Scope is from first declaration when assigned, and lasts for the enclosing line, code block `( )`, or nested blocks.

Variables in JSONata are _not values held in memory-allocated space_ but rather _bindings_. In effect this means that variables can only be assigned, then referred to. Once assigned, further references to the variable are replaced at evaluation with the originally evaluated value at assignment.
In practice, this means that

- The left hand side of `:=` assignment can only be a variable `$name`, and therefore-
- Variables cannot be modified, only re-assigned
- The value of an assignment is the value assigned, thus `$a:=3` returns 3

Variable use should be avoided in single line expressions and only used in code blocks. Whilst expression lines are evaluated in order of the operators, left to right, JSONata execution is asynchronous and different parts of the expression may be prepared in any order. Any later reference to a variable in an expression may be evaluated _prior_ to an earlier assignment in the same line. It also worth noting that, all variable and object field references are evaluated at the very start of statement execution. Nothing done during the expression execution can reliably update or change these values.
For example: `[$a:=3 .. $b:=6].{"result": $a:=$a+$b, "next": $a}` may or may not work as expected.

## Functions

JSONata has a wide range of inbuilt functions (see documentation) for manipulating:

- strings
- numbers
- aggregation (sum, average)
- arrays
- objects
- time (limited to date-time string <-> Unix millisecond)

There are also several higher-order functions, such as `$map()` and `$reduce()` which apply a mapping function over an array, and similarly with result accumulation.

Functions can be nested, so that

`$substringAfter($substringBefore("2024-01-10T10:32:14.0324","."),"T")` returns just the time part of the string.

The _function chaining_ operator `~>` allows for greater visual clarity

`$substringBefore("2024-01-10T10:32:14.0324",".") ~> $substringAfter("T")`.

This works with the function chain passing the result as context, and subsequent functions permitting an optional parameter to be substituted by this context.

**Additional features:**
Regex is available in JSONata. The usual regex format `/regular_expression/flags` applies, and this can be used in the functions $match(), $contains(), $split() and $replace(). In addition, a regex expression can be used _as a function_.

`$join($entities().*[state = "on" and entity_id ~> /^light|^switch/].attributes.friendly_name, ", ")`

- `$entities()` returns an object containing all Home Assistant entities, each _key_ being an entity id, and _value_ being an object with details of that entity
- `.*` maps over the object matching all keys, therefore returning an array of all entities
- `[]` filters out the entities that match the predicate expression, using
  - `state = "on"` to match all entities with state 'on'
  - `entity_id ~> /^light|^switch/` generates a function from the regex expression "match any string containing 'light' or 'switch'". Each `entity_id` is passed to this function, which
  - returns a Boolean true or false, and
  - when both parts of the predicate expression are true, the entity is selected (otherwise the entity is not returned in the result)
- the result of this is an array of _selected entities_
- the field `attributes.friendly_name` is picked out, resulting in an array of _friendly names_ for all lights / switches left on
- then the `$join()` function joins each item in the array, using ", " as the separator, and returning a string

Note that the `$entities()` function is a special function added just to the WebSocket nodes.

Note that entity id names are made up from a domain (platform / integration) and name, separated by `.`. This is potentially confusing as the object key becomes `person.george`. Where object keys contain spaces and special characters, the `payload.'person.george'` referencing syntax has to be used.

**User defined functions:**
User functions can be easily defined and assigned to a variable name using the syntax

`$fname:= function(arg){"Result Is " & arg}`.

Once defined the function can be called using `$fname(parmValue)` from later within the enclosing code block.

## Code blocks

To breakout from the constraints of just a single line expression, JSONata permits the use of `(expression; expression)` code blocks. These start and end with `( )` and contain one or more line expressions terminated by `;`. The return value of the block is the return of the execution result of the very last line.

Using code blocks permits a much richer coding experience, allowing the use of variable and function definitions.

## How it works in practice

The following expression takes an object in payload and re-sorts the object keys alphabetically.

`$keys(payload)^($).{$:$lookup($$.payload,$)}~>$merge()`

This works by

- using `$keys()` to obtain an array of key name strings from the object in payload
  - sorting this array alphabetically
- mapping over the sorted array of keys, creating a new object for each key
- with the context (each key in the iteration) as the new object key
- and using `$lookup(object, key)` to find the value of this key, as the new object value
  - where `$$.payload` refers back to the `$$` _top level_ context to reach `payload`, and `$` the _current_ context (the key in each iteration)
- thus producing an result array with each new key:object pair (in the new order)
- and then using `$merge()` to merge this array of objects back into one object

The simplicity comes from the power of JSONata to map, filter, sort and aggregate, however compared to most procedural languages it is a new way of thinking. Since the JSON object and variables cannot be modified, there is the question of how to, for example, change just one element in an array. The expression `$array[2]:=10` will return an error since the left hand side of assignment can _only_ be a variable and not an expression. To achieve this requires a _declaration_ of the new array, built as follows.

```jsonata
  (
    $array:=[1, 2, 3, 4, 5, 6];
    $newval:=10;
    $index:=2;
    $append($array[[0..$index-1]], $newval)~>$append($array[[$index+1..$count($array)]])
  )
```

Here we declare the result to be the first part of the array up to the new value, the new value, then the remainder of the array. You may note that `$count($array)` is incorrect being one greater than the end index, however as JSONata does not complain when accessing beyond the array length, this point can be relaxed.

**It is worth noting** that it is not necessary to refer to the input JSON document. The following expression generates an array of 24 objects.
`([1..24])#$pos.{"index": $, "hour": $formatInteger($pos, "09") & ":00"}`

**Declarative functional programming for objects:**
Given an object in msg.payload, how then do we change just one field value, since `payload.field:="new value"` is _not_ permitted? The answer is that we have to write a "function" that declares - that is, returns - the result we require, with the idea that JSONata expressions are functions applied to the input JSON object.

The `$spread()` function takes a JSON object and returns an array of objects, each with a single key:value pair.
The `$merge()` function reverses this, taking an array of objects and combining back into one object. A particular feature of this function is that, where key values are duplicated, the end result contains only the _last_ such key to be found.
Therefore, the approach to take is to spread the object, append the replacement key:value as an object to the end of this array, then to merge the array back together.

```jsonata
 (
   $object:={"first": 1, "second": 2, "third": 3};
   $replaceKey:= "second";
   $replaceVal:= 15;
   $spread($object) ~> $append({$replaceKey: $replaceVal}) ~> $merge()
 )
```

Deeply nested objects are much more complex, as the entire tree has to be unpicked and rebuilt in order. Fortunately there is a special function that can perform [transformation](https://docs.jsonata.org/other-operators#-------transform) on an object for us.
`$object ~> | $ | {"second": 15} |`

## Errors and error handling

JSONata has minimal error management.
Errors occur at compile time when editing due to incorrect syntax, and will show as red line box in the UI input field, as well as a red triangle on the node. Common reasons for this are missing:

- `&` between string concatenation
- `:` in conditional testing, or in object construction
- `;` line terminators

Errors at run time are mostly limited to passing nothing or an incorrect type as parameter to a function. The `$number()` function accepts a string and returns a JSON number, but only where the input can be correctly parsed. JSON numbers must only contain numbers throughout. Passing `"12,34a"` will generate a fatal error, and the entire expression evaluation will be aborted.

Where functions _explicitly_ require an array, passing singletons will generate an error, and thus the use of `[ ]` to either construct arrays or cast singletons to an array may be required, for example `$append(payload.array, [$additional])`. Where necessary the use of `$exits()` to check for object fields, and the use of `$type()` can help.

## Writing JSONata code

JSONata can be directly entered into any node where the UI field entry type is **J: expression**. The Node-RED editor permits expansion of the simple box using the '...' field at the end of the line. This editor provides more space, the ability to select and insert JSONata functions from a pick list, a formatting option, and a tab for testing. However, this can be limited and the [try JSONata](https://try.jsonata.org) website is easier to use.

If using the JSONata Exerciser website, use a debug node set to output the "complete message", copy this entire object and paste over the left hand side JSON input object (there is a useful formatter option). Test JSONata code can then be written in the top right hand window, and the result appears immediately below. Useful output messages indicate where there is an error in the input JSON, where no result is generated, or where an error has occurred.

Note that there are special Node-RED functions, `$env()` is one, that can be tested in the Node-RED editor, but not in **try JSONata**. The WebSocket functions, such as `$entity()` cannot be tested in either editor.

## What JSONata cannot do

JSONata can almost completely replace JavaScript in function nodes. However, the simplicity and power of the declarative language is at the expense of efficiency. Arrays and files with more than, say, 500 elements or lines will require significant CPU processing as to temporarily halt Node-RED and potentially Home Assistant. The main barrier to use is more likely to be the time and effort required to generate code, since it can be challenging to think in terms of a functional _declaration_, the outcome of which is the required result, rather than the more usual approach of designing and writing an algorithm to _prescribe_ how to obtain the required result.

Good luck.

```

```
