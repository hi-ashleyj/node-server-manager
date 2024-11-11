<script lang="ts">

    let counter = 0;
    let valids = 0;

    const valid = (c: 1) => {
        valids += c;
    }

    const invalid = (c: 0 | -1) => {
        valids += c;
    }

    const count = (c: 1) => {
        counter += c;
    }

</script>

<slot count={count} invalid={invalid} valid={valid} ok={counter === valids} />