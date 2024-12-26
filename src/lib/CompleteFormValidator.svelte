<script lang="ts">

    let counter = 0;
    let valids = 0;
    let changed = 0;

    const valid = (c: CustomEvent<1 | 0 | -1>) => {
        valids += c.detail;
    }

    const changedEvent = (c: CustomEvent<1 | -1>) => {
        changed += c.detail;
    }

    const count = (c: CustomEvent<1>) => {
        counter += c.detail;
        changed += c.detail;
    }

</script>

<slot count={count} valid={valid} changed={changedEvent} identical={changed === 0} ok={counter === valids} />