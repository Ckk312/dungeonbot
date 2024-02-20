import net.dv8tion.jda.api.JDA;
import net.dv8tion.jda.api.JDABuilder;
import net.dv8tion.jda.api.entities.Activity;
import net.dv8tion.jda.api.utils.cache.CacheFlag;

public class DungeonBot {
    public static void main(String[] args) {
        JDABuilder builder = JDABuilder.createDefault("");

    // Disable parts of the cache
    builder.disableCache(CacheFlag.MEMBER_OVERRIDES, CacheFlag.VOICE_STATE);
    // Enable the bulk delete event
    builder.setBulkDeleteSplittingEnabled(false);
    // Set activity (like "playing Something")
    builder.setActivity(Activity.playing("in the Dungeon"));

    JDA api = builder.build();
    }
}
